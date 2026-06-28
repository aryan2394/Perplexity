import Redis from "ioredis";

// Create clean ioredis connection using env variables
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    tls: {} // Enable SSL/TLS for secure Cloud Redis (Upstash)
});

redis.on("connect", () => {
    console.log("server is connected to redis by shri ji");
});

redis.on("error", (err) => {
    console.error("⚠️ Redis Client Error:", err.message);
});

export default redis;
