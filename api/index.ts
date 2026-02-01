import { app, httpServer } from "../server/app";
import { registerRoutes } from "../server/routes";

// Initialize routes globally (lazy-loaded for cold starts)
let setupPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
    if (!setupPromise) {
        setupPromise = registerRoutes(httpServer, app);
    }
    await setupPromise;

    // Hand off to Express
    app(req, res);
}
