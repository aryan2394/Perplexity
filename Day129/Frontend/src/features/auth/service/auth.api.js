import axios from 'axios'


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

export async function register({ email, username, password }) {
    const response = await api.post("/api/auth/register", { email, username, password })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function verifyEmail(token) {
    const response = await api.get(`/api/auth/verify-email?token=${token}`)
    return response.data
}

export async function logout() {
    const response = await api.post("/api/auth/logout")
    return response.data
}