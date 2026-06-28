import "dotenv/config";
import mongoose from "mongoose";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";

async function main() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    await import("./src/models/user.model.js");
    const User = mongoose.model("User");
    
    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) {
        console.error("No user found in DB.");
        process.exit(1);
    }
    console.log("Found user:", user.email);

    const token = jwt.sign({
        id: user._id.toString(),
        username: user.username
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("Connecting to Socket.IO server at http://127.0.0.1:3000...");
    const socket = io("http://127.0.0.1:3000", {
        extraHeaders: {
            cookie: `token=${token}`
        }
    });

    socket.on("connect", () => {
        console.log("Connected! Emitting sendMessage...");
        socket.emit("sendMessage", {
            message: "latest 10 news of india in geopolitics",
            chatId: null
        });
    });

    socket.on("chatStarted", (data) => {
        console.log("\n--- [EVENT] chatStarted ---");
        console.log("ChatId:", data.chatId);
    });

    socket.on("chatChunk", (data) => {
        process.stdout.write(data.chunk);
    });

    socket.on("chatEnd", (data) => {
        console.log("\n--- [EVENT] chatEnd ---");
        socket.disconnect();
        mongoose.disconnect();
        process.exit(0);
    });

    socket.on("chatError", (data) => {
        console.error("\n--- [EVENT] chatError ---");
        console.error(data);
        socket.disconnect();
        mongoose.disconnect();
        process.exit(1);
    });

    socket.on("connect_error", (err) => {
        console.error("Connection error:", err);
        mongoose.disconnect();
        process.exit(1);
    });

    setTimeout(() => {
        console.error("\nTest timed out after 30 seconds.");
        socket.disconnect();
        mongoose.disconnect();
        process.exit(1);
    }, 30000);
}

main();
