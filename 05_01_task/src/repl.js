/**
 * Interactive REPL for the audio processing agent.
 */

import * as readline from "readline/promises";
import { run } from "./agent.js";
import { resetStats } from "./helpers/stats.js";
import log from "./helpers/logger.js";

export const createReadline = () => 
  readline.createInterface({ input: process.stdin, output: process.stdout });

export const runRepl = async ({ mcpClient, mcpTools, rl }) => {
  let history = [];
  let input = `You are an autonomous radio transmission processing agent.
1. Repeatedly call 'listen' tool to capture all transmissions.
2. If a transmission resulted in a file, try analyze it
3. Your goal is to obtain information about the city which they call Syjon, but in reality it has a different name
4. Once you obtain the information, call 'sendAnswer' tool
5. Output received flag.
Run autonomously`;

  while (true) {
    if (input.toLowerCase() === "exit") break;

    if (input.toLowerCase() === "clear") {
      history = [];
      resetStats();
      log.success("Conversation cleared\n");
      continue;
    }

    if (!input.trim()) continue;

    try {
      const result = await run(input, { mcpClient, mcpTools, conversationHistory: history });
      history = result.conversationHistory;
      console.log(`\nAssistant: ${result.response}\n`);
    } catch (err) {
      log.error("Error", err.message);
      console.log("");
    }

    input = await rl.question("You: ").catch(() => "exit");
  }
};
