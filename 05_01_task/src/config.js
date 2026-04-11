import { resolveModelForProvider } from "../../config.js";

// Validate Gemini API key
if (!process.env.GEMINI_API_KEY) {
  console.error(`\x1b[31mError: GEMINI_API_KEY environment variable is not set\x1b[0m`);
  console.error("       Add it to the repo root .env file: GEMINI_API_KEY=...");
  process.exit(1);
}

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const api = {
  model: resolveModelForProvider("gpt-5.4"),
  visionModel: resolveModelForProvider("gpt-5.2"),
  maxOutputTokens: 16384,
  instructions: ''
};

export const gemini = {
  apiKey: GEMINI_API_KEY,
  audioModel: "gemini-2.5-flash",
  ttsModel: "gemini-2.5-flash-preview-tts"
};

export const outputFolder = "workspace/output";
