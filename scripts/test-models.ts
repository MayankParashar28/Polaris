import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in env");
        process.exit(1);
    }

    console.log("Testing models with key ending in: ..." + key.slice(-4));
    const genAI = new GoogleGenerativeAI(key);

    const modelsToTest = [
        "gemini-2.0-flash-lite-preview-02-05", // Try the lite preview
        "gemini-2.0-flash-exp",
        "gemini-pro-latest",
        "gemini-2.5-flash-lite-preview-09-2025",
        "gemini-2.0-flash" // Retrying just in case
    ];

    console.log("\nStarting connectivity tests...\n");

    for (const modelName of modelsToTest) {
        process.stdout.write(`Testing ${modelName.padEnd(20)}: `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: "Hello, strictly return just the word 'OK'." }] }],
            });
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS - Response: "${text.trim()}"`);
        } catch (err: any) {
            let msg = err.message || String(err);
            if (msg.includes("429")) msg = "429 Too Many Requests (Rate Limit)";
            if (msg.includes("404")) msg = "404 Not Found (Model may not exist or be accessible)";
            console.log(`❌ FAILED - ${msg.split('\n')[0].substring(0, 100)}...`);
        }
    }
}

main();
