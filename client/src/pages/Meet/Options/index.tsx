import { useState } from 'react'
import './style.css'

interface VideoConfig {
    cameraOn: boolean,
    micOn: boolean,
    deafened: boolean
    messageBoxOn: boolean
}

interface OptionsProps {
    videoConfig: VideoConfig
    setVideoConfig: (_:VideoConfig) => void,
    socket: any
}

export default function Options({videoConfig, setVideoConfig, socket}: OptionsProps) {
    if(!socket) return;
    return(
        <div id="options">
            <button 
                className={`fas fa-${videoConfig.micOn ? 'microphone' : 'microphone-slash'}`}
                onClick={() => setVideoConfig({...videoConfig, micOn: !videoConfig.micOn })}
            ></button>
            
            <button 
                className={`fas fa-${!videoConfig.deafened ? 'volume-up' : 'volume-off'}`}
                onClick={() => setVideoConfig({...videoConfig, deafened: !videoConfig.deafened })}
            ></button>

            <button 
                className={`fas fa-comment-alt ${!videoConfig.messageBoxOn ? 'messageOff' : 'messageOn'}`}
                onClick={() => setVideoConfig({...videoConfig, messageBoxOn: !videoConfig.messageBoxOn })}
            ></button>

            <button 
                className={`fas fa-forward`}
                onClick={() => socket.emit('skip')}
            ></button>
        </div>
    )
}