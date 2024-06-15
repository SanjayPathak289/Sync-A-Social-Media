import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import Message from '../model/messageModel.js';
import Conversation from '../model/conversationModel.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
const userSocketMap = {};

export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId];
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId != "undefined") {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
        try {
            await Message.updateMany({
                conversationId: conversationId,
                seen: false
            }, {
                $set: {
                    seen: true
                }
            })
            await Conversation.updateOne({
                _id : conversationId
            }, {
                $set : {
                    "lastMessage.seen" : true
                }
            })
            io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
});


export { io, server, app };