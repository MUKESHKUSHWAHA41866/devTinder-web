import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const login = () => {
  const [emailId, setEmailId] = useState("mukesh@gmail.com");
  const [password, setPassword] = useState("Mukesh@123");
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
  dispatch(addUser(res.data))
  navigate("/");
  }
    catch(err){
      console.error(err)
    }
  }

  return (
    <div className=' flex justify-center my-10'>
      <div className="card bg-base-300 w-96 shadow-sm">
  <div className="card-body">
    <h2 className="card-title justify-center">Login</h2>
     <div>
     <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-4">Email ID</legend>
  <input type="email" value={emailId} className="input w-full max-w-xs" onChange={(e)=> setEmailId(e.target.value)} placeholder="" />
   
</fieldset>
     <fieldset className="fieldset w-full max-w-xs ">
  <legend className="fieldset-legend pt-3">Password</legend>
  <input type="password" value={password} className="input w-full max-w-xs" onChange={(e)=> setPassword(e.target.value)} placeholder="" />
   
</fieldset>
     </div>
    <div className="card-actions justify-center m-2">
      <button className="btn btn-primary" onClick={handleLogin}>Login</button>
    </div>
  </div>
</div>
      </div>
  )
}

export default login