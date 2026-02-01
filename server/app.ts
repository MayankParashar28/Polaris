import express from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";

export const app = express();
export const httpServer = createServer(app);

// Request Logger
export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    console.log(`${req.method} ${path} - Start`); // DEBUG LOG

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
        }
    });

    next();
});

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

app.use(
    express.json({
        limit: "50mb",
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Setup Authentication and Session Management
setupAuth(app);
