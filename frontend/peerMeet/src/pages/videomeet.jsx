import React, { useState, useRef, useEffect} from 'react';
import "./videomeet.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from "socket.io-client";
import VideocamIcon from '@mui/icons-material/Videocam'; 
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Badge, IconButton } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';


const server_url = "http://localhost:8080";
var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

export default function VideoMeet() {
    var socketRef = useRef();
    let socketId = useRef();
    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [screenAvailable, setScreenAvailable] = useState();
    let [screen,setScreen]=useState();
    let [messages, setMessages] = useState([])
    let [showModal,setModal]=useState(true);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);
    let routeTo=useNavigate();

    useEffect(() => {
    if (
        !askForUsername &&
        localVideoRef.current &&
        window.localStream
    ) {
        localVideoRef.current.srcObject = window.localStream;
    }
}, [askForUsername]);

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let createBlackSilenceStream = () => {
        return new MediaStream([black(), silence()]);
    };

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => false);
            setVideoAvailable(!!videoPermission);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => false);
            setAudioAvailable(!!audioPermission);

             if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoPermission || audioPermission) {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: !!videoPermission, 
                    audio: !!audioPermission 
                });

                window.localStream = mediaStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = mediaStream;
                }
            } else {
                // Fallback if no devices are found or permitted
                window.localStream = createBlackSilenceStream();
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = window.localStream;
                }
            }
        } catch (err) {
            console.log("Error getting permissions:", err);
        }
    };

    useEffect(() => {
        getPermissions();
    }, []);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketId.current) {
            if (signal.sdp) {
                if (!connections[fromId]) return;
                
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                                }).catch((e) => console.log(e));
                            }).catch((e) => console.log(e));
                        }
                    }).catch((e) => console.log(e));
            }
            if (signal.ice && connections[fromId]) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

   const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current && !showModal) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };


    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on("signal", gotMessageFromServer);
        
        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketId.current = socketRef.current.id;
            
            socketRef.current.on("chat-message", addMessage);
            
            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    // CRITICAL FIX: Skip connecting to yourself or overwriting existing active connections
                    if (socketListId === socketId.current) return;
                    if (connections[socketListId]) return; 

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    // MODERN WEBRTC API: Use ontrack instead of deprecated onaddstream
                    // MODERN WEBRTC API: Use ontrack instead of deprecated onaddstream
                    connections[socketListId].ontrack = (event) => {
    
                        // FIX: Race condition se bachne ke liye functional state (prevVideos) ka use karenge
                        setVideos((prevVideos) => {
                        // Yahan hum bilkul accurate aur latest videos array check kar rahe hain
                            let videoExists = prevVideos.find(video => video.socketId === socketListId);

                            if (videoExists) {
                            // Agar user ki video pehle se array mein hai, toh naya box mat banao, bas stream map kar do
                            const updatedVideos = prevVideos.map(video =>
                            video.socketId === socketListId
                            ?{ ...video, stream: event.streams[0] }
                            : video
                            );
                            videoRef.current = updatedVideos; // Ref ko bhi update kar rahe hain future reference ke liye
                            return updatedVideos;
                        } else {
                        // Agar user pehle se array mein NAHI hai, tabhi ek naya video element push hoga
                        let newVideo = {
                        socketId: socketListId,
                        stream: event.streams[0],
                        autoPlay: true,
                        playsinline: true,
                        };
                        const updatedVideos = [...prevVideos, newVideo];
                        videoRef.current = updatedVideos;
                        return updatedVideos;
                    }
                });
            };

                    // Add existing tracks to the peer connection
                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    } else {
                        window.localStream = createBlackSilenceStream();
                        window.localStream.getTracks().forEach(track => {
                            connections[socketListId].addTrack(track, window.localStream);
                        });
                    }
                });

                // If you are the newly joined user, create and send offers to everyone else
                if (id === socketId.current) {
                    for (let id2 in connections) {
                        if (id2 === socketId.current) continue;
                        
                        connections[id2].createOffer()
                            .then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                                    });
                            })
                            .catch((e) => console.log(e));
                    }
                }
            });
        });
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        setAskForUsername(false);
        connectToSocketServer();
    };

    let handleVideoToggle = () => {
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setVideo(!video);
        }
    };

    let handleAudioToggle = () => {
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setAudio(!audio);
        }
    };

    let handleScreenToggle = async () => {
    if (!screen) {
    
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            for (let id in connections) {
                let senders = connections[id].getSenders();
                let videoSender = senders.find(sender => sender.track && sender.track.kind === "video");
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack);
                }
            }

            localVideoRef.current.srcObject = screenStream;
            setScreen(true);

            screenTrack.onended = () => {
                stopScreenShare();
            };

        } catch (err) {
            console.log(err);
        }
    } else {
        stopScreenShare();
    }
};

let stopScreenShare = async () => {
    try {
        if (localVideoRef.current.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraVideoTrack = cameraStream.getVideoTracks()[0];

        cameraVideoTrack.enabled = video;

        for (let id in connections) {
            let senders = connections[id].getSenders();
            let videoSender = senders.find(sender => sender.track && sender.track.kind === "video");
            if (videoSender) {
                videoSender.replaceTrack(cameraVideoTrack);
            }
        }

        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => window.localStream.removeTrack(track));
            window.localStream.addTrack(cameraVideoTrack);
        }

        localVideoRef.current.srcObject = window.localStream;
        setScreen(false);

    } catch (err) {
        console.log(err);
    }
};
 let sendMessage=()=>{
    if (message.trim() !== "") {
            socketRef.current.emit("chat-message", message, username);
            setMessage("");
     }
 }
 let handleEndCall=()=>{
    try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track=>track.stop());
    }catch(e){
        console.log(e);
    }
    routeTo("/");
 }

    return (
        <div>
            {askForUsername === true ? (
                <div>
                    <h2 style={{ color: "black" }}>Enter Into Lobby</h2>
                    <TextField id="outlined-basic" label="Username" value={username} variant="outlined" onChange={(e) => setUsername(e.target.value)} />
                    <Button variant="contained" onClick={getMedia}>Connect</Button>
                    <div>
                        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }}></video>
                    </div>
                </div>
            ) : (
                <div className='meetVideoContainer'>
                    {showModal?
                    <div className="chatRoom">
                        <div className="chatContainer">
                            <h1>Chat</h1>
                            <div className="chattingDisplay">

                                {messages.length !== 0 ? messages.map((item, index) => {

                                    console.log(messages)
                                    return (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No Messages Yet</p>}


                            </div>
                            <div className="chattingArea">
                                <TextField  value={message} onChange={(e)=>setMessage(e.target.value)} id="outlined-basic" label="Enter Your message" variant="outlined" />
                                <Button onClick={sendMessage} variant="contained">Send</Button>
                            </div>
                            
                        </div>
                    </div>:<></>}



                    <div className="buttonContainer">
                        <IconButton onClick={handleVideoToggle}>
                            {(video===true)? <VideocamIcon/> : <VideocamOffIcon/>}
                        </IconButton>
                        <IconButton onClick={handleAudioToggle}>
                            {(audio===true)? <MicIcon/> : <MicOffIcon/>}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{backgroundColor:"red"}}>
                            <CallEndIcon/>
                        </IconButton>
                        {screenAvailable===true?
                        <IconButton onClick={handleScreenToggle}>{screen===true?<ScreenShareIcon/>:<StopScreenShareIcon/>}</IconButton>:<></>}
                        <Badge badgeContent={newMessages} color='secondary'>
                            <IconButton onClick={()=>setModal(!showModal)}><ChatIcon/></IconButton>
                        </Badge>
                    </div>
                    <video className='meetUserVideo' ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }}></video>
                    <div className="conferenceView">
                    {videos.map((video) => (
                        <div  key={video.socketId}>
                            <video
                                data-socket={video.socketId}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                                autoPlay 
                                playsInline
                                style={{ width: '300px' }}
                            ></video>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}