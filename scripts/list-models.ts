import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in env");
        process.exit(1);
    }

    console.log("Using Key:", key.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(key);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to access client
        // There isn't a direct listModels method on the client instance in some SDK versions, 
        // but usually it's close. Let's try the standard fetch approach if SDK fails, 
        // or checks instructions. 
        // Actually the error message said "Call ListModels". 
        // The SDK might NOT expose it easily in high-level. 
        // Let's us a simple fetch to be sure.

        // Using raw fetch for list models to be safe/direct
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods?.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("Error response:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

main();
