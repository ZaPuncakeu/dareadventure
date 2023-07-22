import { useMemo, useState, useRef } from 'react';
import './style.css'
import { config } from '../../../config';
import { io } from 'socket.io-client';
import { servers } from '../../ict-servers';
import { v4 } from 'uuid';
import Messages from './Messages';
import { useLanguage } from '../../hooks/useLanguage';
import Options from './Options';

interface VideoConfig {
    cameraOn: boolean,
    micOn: boolean,
    deafened: boolean,
    messageBoxOn: boolean
}

export default function Meet(){
    const [socket, setSocket] = useState(io(config.server));

    const ref = useRef(null);
    const partnerRef = useRef(null);
    
    const [userId, setUserId] = useState(v4());

    const [remoteStream, setRemoteStream] = useState(null);
    
    const [videoClicked, setVideoClicked] = useState(false);

    const [localStream, setLocalStream] = useState(new MediaStream());
    
    const [videoConfig, setVideoConfig] = useState<VideoConfig>({
        cameraOn: true,
        micOn: true,
        deafened: false,
        messageBoxOn: true
    })

    useMemo(() => {
        initialize();
    }, []);

    

    async function initialize() {
        let peer:RTCPeerConnection;
        let joinTimeout:any;
        let offerSent = false;
        let answerSent = false;
        let stream:any;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            setLocalStream(stream);
        } catch(err) {
            console.log(err);
        }

        // Signals to the server that a new user just joined the call
        socket.emit('joinRoom', { userId });

        socket.on('waiting', () => {
            console.log("Waiting 20 seconds for someone to join...");
            joinTimeout = setTimeout(() => {
                console.log("No one joined, searching for a room...");
                socket.emit('joinRoom', { userId });
            }, 20000000);

            socket.on('user_joined', async () => {
                console.log("Someone joined! timeout canceled.");
                clearTimeout(joinTimeout);
                
                peer = new RTCPeerConnection(servers);

                peer.ontrack = e => {
                    console.log("here");
                    setRemoteStream(e.streams[0]);
                }
        
                stream.getTracks().forEach((track:any) => {
                    peer.addTrack(track, stream);
                })
                
                peer.onicecandidate = e => {
                    if(e.candidate && !offerSent) {
                        offerSent = true;
                        console.log(e.candidate);
                        socket.emit('offer', {
                            offerDescription: peer.localDescription,
                            candidate: e.candidate
                        });
                    }
                }

                const offerDescription = await peer.createOffer();
                peer.setLocalDescription(offerDescription);
            })
        });

        socket.on('reset', () =>{
            setRemoteStream(null);
            socket.emit('joinRoom', { userId });
            offerSent = false;
            answerSent = false;
        })

        socket.on('process-offer', async ({offerDescription, candidate}) => {
            peer = new RTCPeerConnection(servers);
                
            peer.ontrack = e => {
                console.log("here");
                setRemoteStream(e.streams[0]);
            }
    
            stream.getTracks().forEach((track:any) => {
                peer.addTrack(track, stream);
            })
            
            peer.onicecandidate = e => {
                if(e.candidate && !answerSent) {
                    answerSent = true
                    socket.emit('answer', {
                        answerDescription: peer.localDescription,
                        candidate: e.candidate
                    });
                }
            }
            
            await peer.setRemoteDescription(offerDescription);
            peer.addIceCandidate(candidate);
            
            const answerDescription = await peer.createAnswer();
            peer.setLocalDescription(answerDescription);
        })

        socket.on('process-answer', async ({answerDescription, candidate}) => {
            await peer.setRemoteDescription(answerDescription);
            peer.addIceCandidate(candidate);
        })
    }

    useMemo(() => {
        //ref.current.srcObject = localStream;
        if(!ref.current) return;
        const v:any = ref.current;
        v.srcObject = localStream;
        v.muted = true;
        v.play();
    }, [localStream])

    useMemo(() => {
        //ref.current.srcObject = localStream;
        if(!partnerRef.current) return;
        const v:any = partnerRef.current;
        v.srcObject = remoteStream;
        v.play();
    }, [remoteStream])

    useMemo(() => {
        if(localStream.getAudioTracks().length <= 0) return;
        localStream.getAudioTracks()[0].enabled = videoConfig.micOn;
    }, [videoConfig]);

    const { text } = useLanguage();

    return(
        <div id="meet">
            <div className='video-container'>
                <video 
                    id="partner" 
                    ref={partnerRef}
                    muted={videoConfig.deafened} 
                    style={{
                        display: `${!remoteStream ? 'none': 'block'}`
                    }}
                />
                
                {
                    !remoteStream ? 
                    <h2 className='lexend'>
                        {text.Meet.searching}
                    </h2>
                    :
                    <>
                        <Options
                            videoConfig={videoConfig}
                            setVideoConfig={setVideoConfig}
                            socket={socket}
                        />
                    </>
                }
            </div>
            {
                !remoteStream ? 
                null
                :
                <>
                    <Messages socket={socket} id={userId} messageBoxOn={videoConfig.messageBoxOn} />
                </>
            }
            
            <video 
                ref={ref} 
                id="me"
                onMouseDown={(e:any) => {
                    setVideoClicked(true);
                }}

                onMouseMove={(e:any) => {
                    if(!ref.current || !videoClicked) return;
                    console.log(e.clientX);
                    const v:any = ref.current;
                    v.style.left = (parseInt(e.clientX) - 100)+"px";
                    v.style.top = (parseInt(e.clientY) - 50)+"px";
                }} 

                onMouseUp={(e:any) => {
                    setVideoClicked(false);
                }}
            />
        </div>
    )
}