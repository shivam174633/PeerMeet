import React, { useState, useRef, useEffect} from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate} from 'react-router-dom';

import "./home.css";
import { IconButton,Button } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import TextField from '@mui/material/TextField';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent(){
    let navigate=useNavigate();
    const [meetingCode,setMeetingCode]=useState("");

    const {addToUserHistory}=useContext(AuthContext);

    let handleJoinVideoCall=async ()=>{
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }
    return(
        <div className='homePage'>
        <div className="navBar">
            <div style={{display:"flex", alignItems:"center"}}>
                <h2>PeerMeet</h2>
            </div>

            <div style={{display:"flex", alignItems:"center"}}>
                <IconButton style={{ color: "white" }} onClick={()=>{
                    navigate("/history");
                }}>
                    <RestoreIcon/>
                    <p>History</p>
                </IconButton>
                <Button variant="contained" onClick={()=>{
                    localStorage.removeItem("token");
                    navigate("/auth");
                }}>Logout</Button>
            </div>
        </div>

        <div className="meetContainer">
            <div className="leftPanel">
                <div>
                    <h2>Providing Quality Video Call</h2>
                    <br></br> <br></br>
                    <div style={{display:"flex", gap:"10px"}}>
                        <TextField className="meetingField" value={meetingCode} onChange={(e)=>setMeetingCode(e.target.value)} id="outlined-basic" label="Enter Meeting-Code" variant="outlined" />
                        <Button variant='contained' onClick={handleJoinVideoCall}>Join</Button>
                    </div>
                </div>
            </div>
            <div className="rightPanel">
               <img src="/logo3.png" alt="Logo" />
            </div>
        </div>
        </div>
    )
}

export default withAuth(HomeComponent)