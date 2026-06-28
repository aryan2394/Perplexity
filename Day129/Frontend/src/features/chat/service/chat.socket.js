import { io } from "socket.io-client";
import { createNewChat, addNewMessage, appendMessageChunk, setLoading, setError, setCurrentChatId } from "../chat.slice";

let SOCKET_URL = "";

if (import.meta.env.VITE_SOCKET_URL) {
    SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
} else if (import.meta.env.MODE === 'production') {
    SOCKET_URL = ""; // Relative URL (same origin) in production
} else {
    SOCKET_URL = "http://localhost:3000"; // Development server URL
}

export let socket = null;

export const initializeSocketConnection = (dispatch) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

    socket.on("chatStarted", ({ chatId, title, userMessage }) => {
        // If it's a new chat, create it in state and set current chatId
        dispatch(createNewChat({
            chatId,
            title
        }));
        dispatch(setCurrentChatId(chatId));

        // Add the user message
        dispatch(addNewMessage({
            chatId,
            content: userMessage.content,
            role: "user"
        }));

        // Add an empty AI message where chunks will be appended
        dispatch(addNewMessage({
            chatId,
            content: "",
            role: "ai"
        }));
    });

    socket.on("chatChunk", ({ chatId, chunk }) => {
        dispatch(appendMessageChunk({
            chatId,
            chunk
        }));
    });

    socket.on("chatEnd", ({ chatId, aiMessage }) => {
        dispatch(setLoading(false));
    });

    socket.on("chatError", ({ error }) => {
        console.error("Socket chat error:", error);
        dispatch(setError(error));
        dispatch(setLoading(false));
    });

    return socket;
}

export const emitSendMessage = ({ message, chatId }) => {
    if (socket) {
        socket.emit("sendMessage", { message, chatId });
    } else {
        console.error("Socket not initialized");
    }
}