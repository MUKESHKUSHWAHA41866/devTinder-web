import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async() =>{
   
   try{ const res = await axios.post(BASE_URL+"/login",{
      emailId,
      password,
    },{
      withCredentials: true
    });
  // console.log(res.data);
  dispatch(addUser(res.data));
   return navigate("/");
  }
    catch(err){
      setError(err?.response?.data || "Somethings went wrong");
      console.error(err)
    }
  }

  const handleSignUp = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        {firstName,lastName,emailId,password},{
          withCredentials: true
        }
      );
       dispatch(addUser(res.data.data))
    return navigate("/profile");
    } catch (err) {
       setError(err?.response?.data || "Somethings went wrong");
      console.error(err)
    }
  }

  return (
    <div className=' flex justify-center my-10'>
      <div className="card bg-base-300 w-96 shadow-sm">
  <div className="card-body">
    <h2 className="card-title justify-center">{isLoginForm ? "Login" : "Sign Up"}</h2>
     <div>
    {!isLoginForm && (
      <>
       <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-4">First Name</legend>
  <input type="email" value={firstName} className="input w-full max-w-xs" onChange={(e)=> setFirstName(e.target.value)} placeholder="" />
   
</fieldset>
     <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-4">Last Name</legend>
  <input type="email" value={lastName} className="input w-full max-w-xs" onChange={(e)=> setLastName(e.target.value)} placeholder="" />
   
</fieldset>
      </>
    )}
     <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-4">Email ID</legend>
  <input type="email" value={emailId} className="input w-full max-w-xs" onChange={(e)=> setEmailId(e.target.value)} placeholder="" />
   
</fieldset>
     <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-3">Password</legend>
  <input type="password" value={password} className="input w-full max-w-xs" onChange={(e)=> setPassword(e.target.value)} placeholder="" />
   
</fieldset>
     </div>
     <p className='text-red-600'>{error}</p>
    <div className="card-actions justify-center m-2">
      <button className="btn btn-primary" onClick={isLoginForm ? handleLogin : handleSignUp}>
      {isLoginForm? "Login" : "Sign Up"}</button>
    </div>
    <p  className='m-auto cursor-pointer py-2' onClick={()=> setIsLoginForm((value) => !value)}>{isLoginForm? "New User? Signup Here" : "Existing User? Login Here"}</p>
  </div>
</div>
      </div>
  )
}

export default login