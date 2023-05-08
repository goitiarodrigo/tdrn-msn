import express from 'express'
import cors from 'cors'
import http from 'http'
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io'

const app = express()
// app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }})



const sessions: any = {}

// app.get('/', (req, res) => {
//     // Devolver un mensaje de éxito para indicar que la ruta está definida
//     res.send('WebSocket server is running')
// })


io.on('connection', (socket) => {
    let sessionID = socket.handshake.query.sessionID

    if (!sessionID){
        sessionID = uuidv4()
        console.log('Nueva conexión: ', sessionID)
        socket.handshake.query.sessionID = sessionID
        socket.emit('sessionID', sessionID)
    }

    if (!sessions[sessionID!.toString()]) {
        sessions[sessionID!.toString()] = {
            username: null,
            contacts: [],
        }
    }

    socket.on('login', ({username}) => {
        sessions[sessionID!.toString()].userId = socket.id
        sessions[sessionID!.toString()].username = username
    })

    socket.on('addContact', ({contact}) => {
        sessions[sessionID!.toString()].contact.push(contact)
    })

    socket.on('message', ({recipientID, message}) => {
        console.log(recipientID, message)
        const session = sessions[sessionID!.toString()]
        const recipientSocket = sessions[recipientID]
        console.log(recipientSocket)
        if (recipientSocket && session) {
            socket.to(recipientSocket.userId).emit('message', {
                senderId: socket.id,
                message
            })
        }
    })

    socket.emit('sessionList', sessions)

    socket.on('disconnect', () => {
        console.log('Se ha desconectado: ', sessionID)
        delete sessions[sessionID!.toString()]
    })
    


})
const port = 3100;

server.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});