import axios from "axios";

let API_BASE_URL = "";

if (import.meta.env.VITE_API_BASE_URL) {
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
} else if (import.meta.env.MODE === 'production') {
    API_BASE_URL = ""; // Relative URL in production (Render)
} else {
    API_BASE_URL = "http://localhost:3000"; // Local backend in development
}

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})


export const sendMessage = async ({ message, chatId }) => {
    const response = await api.post("/api/chats/message", { message, chat: chatId })
    return response.data
}

export const getChats = async () => {
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

