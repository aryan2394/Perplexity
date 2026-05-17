import { io } from "socket.io-client";


let SOCKET_URL = "";

if (import.meta.env.VITE_SOCKET_URL) {
    SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
} else if (import.meta.env.MODE === 'production') {
    SOCKET_URL = ""; // Relative URL (same origin) in production
} else {
    SOCKET_URL = "http://localhost:3000"; // Development server URL
}

export const initializeSocketConnection = () => {

    const socket = io(SOCKET_URL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

}