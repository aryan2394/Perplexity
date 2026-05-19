import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

// Serve static assets from public folder (build output of frontend)
app.use(express.static(path.resolve("public")));

// Keep-alive endpoint for UptimeRobot
app.get("/ping", (req, res) => {
    res.status(200).send("pong");
});

// Health check endpoint (useful for Render deployment verification)
app.get("/api/health", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// Fallback to serving the frontend React index.html for client-side routing (React Router)
app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

export default app;
