import { useMemo, useState, useRef, useEffect } from 'react';
import './style.css'
import { useLanguage } from '../../../hooks/useLanguage';
import { motion } from 'framer-motion';

interface MessageProp {
    socket:any,
    id: string,
    messageBoxOn: boolean
}

interface Msg {
    id: string,
    message: string
}


export default function Messages({socket, id, messageBoxOn}:MessageProp){
    const { text } = useLanguage();
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const ref = useRef(null)
    const refContainer = useRef(null);
    const [nmsg, setNewMsg] = useState(null);

    useEffect(() => {
        socket.on('new_message', (new_msg:Msg) => {
            setNewMsg(new_msg)
        });

        function keyDownHandler(e:any) {
            if (e.key === 'Enter') {
                send();
            }
        }

        document.addEventListener('keydown', keyDownHandler);

        return () => {
        document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);

    useEffect(() => {
        if(!nmsg) return;
        setMsgs([...msgs, nmsg]);
        setNewMsg(null);
    }, [nmsg])

    function send() {
        const r:any = ref.current
        if(!r) return;
        const message = r.value;
        r.value = "";
        socket.emit('send_message', {
            message,
            id
        })
    }

    useEffect(() => {
        const c:any = refContainer.current
        if(!c) return;
        c.scrollTop = c.scrollHeight;
    }, [msgs])

    return(
        <motion.div 
            id="messages"
            initial={{
                width: !messageBoxOn ? "300px" : "0px",
                x: !messageBoxOn ? "0" : "300px"
            }}

            animate={{
                width: !messageBoxOn ? "0px" : "300px",
                x: !messageBoxOn ? "300px" : "0"
            }}

            transition={{
                duration: 0.8
            }}
        >
            <h1 className='lexend'>{text.Messages.chat}</h1>
            <div ref={refContainer} className='texts'>
                {
                    msgs.map((msg:Msg, index) => {
                        return(
                            <p key={JSON.stringify(msg) + index} className='lexend'>
                                <b style={{
                                    color: `${msg.id === id ? 'blue' : 'red'}`
                                }}>{msg.id === id ? text.Messages.you : text.Messages.partner}</b>:
                                &nbsp;
                                {msg.message}
                            </p>
                        )
                    })
                }
            </div>
            <div className='input'>
                <input className='lexend' ref={ref} type="text" placeholder={text.Messages.write} />
                <button className='lobster' onClick={send}><i className='fas fa-send'></i>&nbsp;{text.Messages.send}</button>
            </div>
        </motion.div>
    )
}