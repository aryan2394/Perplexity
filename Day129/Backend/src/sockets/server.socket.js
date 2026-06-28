import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatTitle, generateResponseStream } from "../services/ai.service.js";

let io;

export function initSocket(httpServer) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    io = new Server(httpServer, {
        cors: {
            origin: clientUrl,
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)

        socket.on("sendMessage", async ({ message, chatId }) => {
            console.log(`[SOCKET] Received sendMessage event from ${socket.id}. Message: "${message}", chatId: ${chatId}`);
            try {
                // 1. Authenticate user from handshake cookies
                const cookieHeader = socket.handshake.headers.cookie;
                console.log(`[SOCKET] Cookie header:`, cookieHeader);
                let token;
                if (cookieHeader) {
                    const parsed = Object.fromEntries(cookieHeader.split(";").map(c => {
                        const parts = c.trim().split("=");
                        return [parts[0], parts.slice(1).join("=")];
                    }));
                    token = parsed.token;
                }

                if (!token) {
                    socket.emit("chatError", { error: "Authentication token missing" });
                    return;
                }

                let userPayload;
                try {
                    userPayload = jwt.verify(token, process.env.JWT_SECRET);
                } catch (e) {
                    socket.emit("chatError", { error: "Invalid token" });
                    return;
                }

                const userId = userPayload.id;

                let title = null;
                let chat = null;

                // 2. If no chatId, generate chat title and create chat record
                if (!chatId) {
                    title = await generateChatTitle(message);
                    chat = await chatModel.create({
                        user: userId,
                        title
                    });
                    chatId = chat._id;
                } else {
                    // Check if chat exists and belongs to the user
                    chat = await chatModel.findOne({ _id: chatId, user: userId });
                    if (!chat) {
                        socket.emit("chatError", { error: "Chat not found" });
                        return;
                    }
                }

                // 3. Create user message in DB
                const userMessage = await messageModel.create({
                    chat: chatId,
                    content: message,
                    role: "user"
                });

                // Emit acknowledgement that user message is saved and chat is created
                socket.emit("chatStarted", {
                    chatId,
                    title: chat.title,
                    userMessage
                });

                // 4. Retrieve message history for AI context
                const messages = await messageModel.find({ chat: chatId });

                // 5. Stream response from AI
                let finalContent = "";
                await generateResponseStream(messages, (chunk) => {
                    finalContent += chunk;
                    socket.emit("chatChunk", {
                        chatId,
                        chunk
                    });
                });

                // 6. Save AI message to DB
                const aiMessage = await messageModel.create({
                    chat: chatId,
                    content: finalContent,
                    role: "ai"
                });

                // Emit chat end event
                socket.emit("chatEnd", {
                    chatId,
                    aiMessage
                });

            } catch (err) {
                console.error("Socket message handling error:", err);
                socket.emit("chatError", { error: err.message || "An error occurred" });
            }
        });
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}