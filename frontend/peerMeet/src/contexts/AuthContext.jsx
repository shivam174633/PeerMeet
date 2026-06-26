import { createContext } from "react";
import axios from "axios";
import { Children } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusCodes } from "http-status-codes";


export const AuthContext=createContext({});

const client=axios.create({
    baseURL:"http://localhost:8080/users"
})

export const AuthProvider=({children})=>{
    const [userData,setUserData]=useState(null);

    const handleRegister=async (name,username,password)=>{
        try{
            let request=await client.post("/register",{
                name:name,
                username:username,
                password:password
            })
            if(request.status===StatusCodes.CREATED){
                return request.data.message
            }
        }catch(err){
            throw err;
        }
    }

    const handleLogin=async(username,password)=>{
        try{
            let request=await client.post("/login",{
                username:username,
                password:password,
            })
            if(request.status===StatusCodes.OK){
                localStorage.setItem("token",request.data.token);
                return request.data.message;
            }
        } catch(err){
            throw err;
        }
    }

    const Router=useNavigate();
    const data={
        userData,setUserData,handleRegister,handleLogin
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}
