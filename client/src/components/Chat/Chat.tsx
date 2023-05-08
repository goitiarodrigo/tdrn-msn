import { useEffect, useState } from "react"
import io from 'socket.io-client'


const socket = io('http://localhost:3100/', {
    query: {sessionID: localStorage.getItem('sessionID') ?? ''}
})
const Chat = () => {

    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [selectedFriend, setSelectedFriend] = useState('')

    useEffect(() => {
        const sessionID = localStorage.getItem('sessionID')
        socket.on("connect", () => {
            // console.log("Socket conectado!");
            socket.emit("sessionID", sessionID);
            socket.emit('login', {username: 'Rodrigo'})
        });
        socket.on('sessionID', (id: string) => {
            if (!sessionID) {
                localStorage.setItem('sessionID', id)
            }
        })

        socket.on('sessionList', (sessions) => {
            setUsers(Object.entries(sessions))
        })

        socket.on('message', (message) => {
            console.log(message)
        })
        

        return () => {
            socket.on('disconnect', () => {

            })
        }

    }, [])


    const sendText = () => {
        socket.emit('message', {
            recipientID: selectedFriend,
            message: inputValue
        })
    }

    const handleClick = (id: string) => {
        setSelectedFriend(id)
    }

    return (
        <div>
            <input 
                onChange={(event) => setInputValue(event.target.value)}
                type="text"
                value={inputValue}
            />
            <button onClick={sendText}>Enviar texto</button>
            {
                users.map((el, index) => {
                    return (
                        <button onClick={() => handleClick(el[0])} key={index}>{el[1].username}</button>
                    )
                })
            }
            {/* <textarea value={}></textarea> */}
        </div>
        
    )
}

export default Chat