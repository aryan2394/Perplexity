import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// Health check endpoint for UptimeRobot (prevents Render sleep)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Fallback for React Router client-side routing
app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default app;
