import React from "react";
import "./landing.css"
import { Link } from "react-router-dom";

export default function LandingPage(){
    return(
    <div className="landingPageContainer">
        <nav>
            <div className="navHeader">
                <h2>PeerMeet</h2>
            </div>
            <div className="navlist">
                <p>Join as Guest</p>
                <p>Register</p>
                <div role="button">
                    <p>Login</p>
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