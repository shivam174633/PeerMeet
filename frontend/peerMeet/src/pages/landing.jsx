import React from "react";
import "./landing.css"
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage(){
    const navigate=useNavigate();
    return(
    <div className="landingPageContainer">
        <nav>
            <div className="navHeader">
                <h2>PeerMeet</h2>
            </div>
            <div className="navlist">
                <p onClick={()=>{
                    navigate("/q23sc");
                }}>Join as Guest</p>

                <p onClick={()=>{
                        navigate("/auth")
                    }}>Register</p>
                <div role="button">
                    <p onClick={()=>{
                        navigate("/auth")
                    }}>Login</p>
                </div>
            </div>
        </nav>

        <div className="landingMainContainer">
            <div>
                <h1> <span style={{color:"#FF9839"}}>Connect</span> Beyond Boundaries</h1>
                <p>Seamless video calls, real-time collaboration, and meaningful conversations—all in one place.</p>
                <div role="button">
                    <Link to={"/auth"}>Get Started</Link>
                </div>
            </div>
            <div>
                <img src="/mobile.png"></img>
            </div>
        </div>
    </div>
   )
}