import jwt from "jsonwebtoken";
import redis from "../config/cache.js";

export async function authUser(req, res, next) {
    const token = req.cookies.token;

    // Check if token exists in cookie
    if (!token) {
        return res.status(401).json({
            "user": "user not have a token by shri ji "
        });
    }

    try {
        // Check if token is blacklisted in Upstash Redis
        const isTokenBlacklisted = await redis.get(token);
        if (isTokenBlacklisted) {
            return res.status(401).json({
                "user": "Invalid token"
            });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            "user": "invalid credentials by shri ji"
        });
    }
}

