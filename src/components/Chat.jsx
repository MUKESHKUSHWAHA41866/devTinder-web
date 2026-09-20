import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const socketRef = useRef(null);

  // helper: extract timestamp from Mongo ObjectId when createdAt missing
  const createdAtFromObjectId = (id) => {
    if (!id || typeof id !== "string" || id.length < 8) return null;
    try {
      const ts = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(ts).toISOString();
    } catch (e) {
      return null;
    }
  };

  const getCreatedAtFromMsg = (msg) => {
    return (
      msg.createdAt || msg.created_at || msg.timestamp || msg.ts || msg.sentAt || msg.sent_at || msg.date || msg.time || createdAtFromObjectId(msg._id) || null
    );
  };

  const getSenderInfo = (msg) => {
    const senderObj = msg.senderId && typeof msg.senderId === "object" ? msg.senderId : null;
    const firstName = senderObj?.firstName || msg.firstName || msg.senderFirstName || msg.sender?.firstName || msg.senderName || msg.sender || "Unknown";
    const lastName = senderObj?.lastName || msg.lastName || msg.senderLastName || msg.sender?.lastName || "";
    const senderId = senderObj?._id || msg.senderId || msg.sender || null;
    return { firstName, lastName, senderId };
  };

  const fetchChatMessages = async () => {
    const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
      withCredentials: true,
    });

    console.log(chat.data.messages);

    const chatMessages = chat?.data?.messages.map((msg) => {
      const createdAt = getCreatedAtFromMsg(msg);
      const { firstName, lastName, senderId } = getSenderInfo(msg);
      const status = msg.status || (msg.readAt || msg.seenAt || msg.seen ? "seen" : msg.delivered ? "delivered" : "sent");
      return {
        firstName,
        lastName,
        text: msg.text,
        createdAt,
        status,
        senderId,
        messageId: msg._id || msg.id || msg.messageId || null,
      };
    });
    setMessages(chatMessages || []);
  };

  useEffect(() => {
    fetchChatMessages();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    socketRef.current = createSocketConnection();
    const socket = socketRef.current;
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageReceived", (incoming) => {
      // normalize incoming message shape robustly
      const createdAt = getCreatedAtFromMsg(incoming) || new Date().toISOString();
      const { firstName, lastName, senderId } = getSenderInfo(incoming);
      const serverId = incoming._id || incoming.id || incoming.messageId || null;
      const status = incoming.status || (incoming.readAt || incoming.seenAt || incoming.seen ? "seen" : incoming.delivered ? "delivered" : "sent");
      const mapped = {
        firstName,
        lastName,
        text: incoming.text,
        messageId: serverId,
        createdAt,
        status,
        senderId,
      };
      setMessages((prev) => {
        // avoid duplicate when existing temp message is in list
        if (serverId) {
          const already = prev.some((m) => m.messageId === serverId || m.messageId === incoming.tempId);
          if (already) {
            return prev.map((m) =>
              m.messageId === incoming.tempId || m.messageId === serverId ? { ...m, ...mapped } : m
            );
          }
        }
        return [...prev, mapped];
      });
    });

    // update when server notifies delivery / seen
    socket.on("messageDelivered", ({ messageId, deliveredAt }) => {
      setMessages((messages) =>
        messages.map((m) =>
          (m.messageId === messageId || m._id === messageId)
            ? { ...m, status: "delivered", deliveredAt }
            : m
        )
      );
    });

    socket.on("messageSeen", ({ messageId, seenAt }) => {
      setMessages((messages) =>
        messages.map((m) =>
          (m.messageId === messageId || m._id === messageId)
            ? { ...m, status: "seen", seenAt }
            : m
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetUserId]);

  // when messages arrive or are fetched, notify server that we've received them (delivered)
  useEffect(() => {
    if (!socketRef.current || !userId) return;
    const toDeliver = messages.filter(
      (m) => m.senderId && String(m.senderId) === String(targetUserId) && m.status !== "delivered" && m.status !== "seen" && (m.messageId || m._id)
    );
    toDeliver.forEach((m) => {
      const messageId = m.messageId || m._id || null;
      if (!messageId) return;
      socketRef.current.emit("messageDelivered", { messageId, userId, targetUserId });
      // optimistic UI update
      setMessages((prev) => prev.map((pm) => (pm.messageId === messageId || pm._id === messageId) ? { ...pm, status: "delivered", deliveredAt: new Date().toISOString() } : pm));
    });
  }, [messages, userId, targetUserId]);

  // when user opens chat, mark other-user messages as seen
  useEffect(() => {
    if (!socketRef.current || !userId) return;
    const unseen = messages.filter(
      (m) => m.senderId && String(m.senderId) === String(targetUserId) && m.status !== "seen" && (m.messageId || m._id)
    );
    if (unseen.length === 0) return;
    // emit seen for each message
    unseen.forEach((m) => {
      const messageId = m.messageId || m._id || null;
      if (!messageId) return;
      socketRef.current.emit("messageSeen", { messageId, userId, targetUserId });
      setMessages((prev) => prev.map((pm) => (pm.messageId === messageId || pm._id === messageId) ? { ...pm, status: "seen", seenAt: new Date().toISOString() } : pm));
    });
  }, [userId, targetUserId]);

  const handleSend = (text) => {
    const socket = socketRef.current || createSocketConnection();
    const tempId = `temp-${Date.now()}`;
    const me = userId;
    // optimistic message
    const tempMsg = {
      messageId: tempId,
      senderId: me,
      firstName: user.firstName,
      lastName: user.lastName,
      text,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setMessages((msgs) => [...msgs, tempMsg]);
    setNewMessage("");
    socket.emit(
      'sendMessage',
      { userId: me, targetUserId, text, tempId },
      (serverMsg) => {
        if (serverMsg?.error) {
          // optionally mark failed
          setMessages((msgs) => msgs.map((m) => (m.messageId === tempId ? { ...m, status: 'failed' } : m)));
          return;
        }
        // replace optimistic message or append if missing
        setMessages((msgs) =>
          msgs.map((m) => (m.messageId === tempId ? { ...serverMsg, messageId: serverMsg._id || serverMsg.id } : m))
        );
      }
    );
  };


  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString();
  };

  const renderTicks = (status) => {
    if (!status) return <span>✓</span>;
    if (status === "sent") return <span>✓</span>;
    if (status === "delivered") return <span>✓✓</span>;
    if (status === "seen" || status === "read") return <span className="text-blue-500">✓✓</span>;
    return <span>✓</span>;
  };

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-scroll p-5">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                ((msg.senderId && msg.senderId === userId) || (user.firstName === msg.firstName && user.lastName === msg.lastName) ? "chat-end" : "chat-start")
              }
            >
              <div className="chat-header">
                {`${msg.firstName || 'Unknown'} ${msg.lastName || ''}`}
                <time className="text-xs opacity-50"> {formatTime(msg.createdAt)}</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">
                {((msg.senderId && msg.senderId === userId) || (user.firstName === msg.firstName && user.lastName === msg.lastName))
                  ? renderTicks(msg.status)
                  : msg.status === "seen" || msg.status === "read"
                  ? "Seen"
                  : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-500 text-white rounded p-2"
        ></input>
        <button onClick={() => handleSend(newMessage)} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;