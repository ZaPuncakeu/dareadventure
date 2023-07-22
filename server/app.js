const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
});
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const port = process.env.PORT || 4000
const cors = require('cors')
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { EventEmitter } = require('stream');
const { Mutex } = require('async-mutex');

const mutex = new Mutex();

app.use(cors({
    origin: 'http://localhost:5173',
}))

// Initializing database :
initializeApp({
    credential: cert(require('YOUR_FIRESTORE_KEY'))
}); 

const db = getFirestore();
console.log("Database initialized.");

io.on('connection', socket => {
    socket.on('joinRoom', (data) => joinRoom(socket, data));

    socket.on('disconnect', async () => {
        console.log("User disconnected");
        if(!socket.roomId) return;
        await deleteRoom(socket.roomId);
        socket.to(socket.roomId).emit('reset');
    })

    socket.on('offer', offer => {
        socket.to(socket.roomId).emit('process-offer', offer);
    })

    socket.on('answer', offer => {
        socket.to(socket.roomId).emit('process-answer', offer);
    })

    socket.on('skip', async () => {
        console.log("User skipped")
        if(!socket.roomId) return;
        await deleteRoom(socket.roomId);
        socket.to(socket.roomId).emit('reset');
        socket.emit('reset');
    })

    socket.on('send_message', msg => {
        console.log(msg);
        socket.to(socket.roomId).emit('new_message', msg);
        socket.emit('new_message', msg);
    })
})

async function joinRoom(socket, { userId }) {
    console.log(`${new Date()}: The user ${userId} is searching for a room...`);
    if(socket.roomId) {
        await deleteRoom(socket.roomId);
    }

    await mutex.runExclusive(async () => {
        const snapshot = await db.collection('rooms')
                                .where("user2", "==", null)
                                .get();
        let room;
        if(snapshot.empty) {
            room = await db.collection('rooms')
                    .add({
                        user1: userId,
                        user2: null
                    });

            socket.join(room.id);
            socket.emit('waiting')
        }
        else 
        {
            const random_room = (Math.floor(Math.random() * snapshot.docs.length));
            room = snapshot.docs[random_room];
            await db.collection('rooms')
                    .doc(room.id)
                    .update({
                        user2: userId
                    });
            
            socket.join(room.id);
            socket.to(room.id).emit('user_joined');
        }

        socket.roomId = room.id;
        
        console.log(`${new Date()}: The user ${userId} joined the room [${room.id}]`);
    })
}

function deleteRoom(roomId) {
    return new Promise(async (resolve, reject) => {
        console.log(`Deleting the room ${roomId}...`);
        await db.collection('rooms')
                .doc(roomId)
                .delete();
        console.log(`Room ${roomId} has been deleted.`);
        resolve("done");
    })
}

server.listen(port, console.log(`Server opened on port: ${port}`));