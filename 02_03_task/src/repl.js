/**
 * Interactive REPL for the graph RAG agent.
 */

import * as readline from "readline/promises";
import { run, createConversation } from "./agent/index.js";
import { indexWorkspace, clearGraph } from "./graph/indexer.js";
import { resetStats } from "./helpers/stats.js";
import log from "./helpers/logger.js";

export const createReadline = () =>
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

/**
 * @param {object} options
 * @param {object} options.tools - Tools from createTools()
 * @param {object} options.rl - Readline interface
 * @param {import("neo4j-driver").Driver} options.driver - Neo4j driver
 */
export const runRepl = async ({ tools, rl, driver }) => {
  let conversation = createConversation();

  let input = `
    There was a failure at the power plant yesterday. 
    You have access to the full system log file from that day—but it’s enormous. 
    Your task is to prepare a condensed version of the logs that:
    contains only events relevant to the failure analysis 
    (power supply, cooling, water pumps, software, and other power plant components), 
    fits within 1,500 tokens, and retains the multi-line format—one event per line.
    You need to download the logs, index them in the graph database you have,
    then try searching and extracting logs.
    Every time you can send a condensed version of logs to the technicians.
    If the logs sent are enough to find the reason for the failure, you will get a flag {FLG: ...}
    Then output this flag
  `;

  while (true) {
    if (input.toLowerCase() === "exit") break;

    if (input.toLowerCase() === "clear") {
      conversation = createConversation();
      resetStats();
      log.success("Conversation cleared\n");
      continue;
    }

    if (input.toLowerCase().startsWith("reindex")) {
      const force = input.toLowerCase().includes("--force");
      if (force) {
        log.start("Clearing graph...");
        await clearGraph(driver);
      }
      log.start("Re-indexing workspace...");
      await indexWorkspace(driver, "workspace");
      log.success("Re-indexing complete\n");
      continue;
    }

    if (!input.trim()) continue;

    try {
      const result = await run(input, {
        tools,
        conversationHistory: conversation.history,
      });

      conversation.history = result.conversationHistory;
      console.log(`\nAssistant: ${result.response}\n`);
    } catch (err) {
      log.error("Error", err.message);
      console.log("");
    }

    input = await rl.question("You: ").catch(() => "exit");
  }
};
