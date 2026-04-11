import { createMcpClient, listMcpTools } from "./src/mcp/client.js";
import { createReadline, runRepl } from "./src/repl.js";
import { onShutdown } from "./src/helpers/shutdown.js";
import { logStats } from "./src/helpers/stats.js";
import fs from 'fs';
import log from "./src/helpers/logger.js";

const main = async () => {
  fs.rmSync("05_01_task/workspace", { recursive: true })
  fs.mkdirSync("05_01_task/workspace/input", { recursive: true });
  fs.mkdirSync("05_01_task/workspace/output", { recursive: true });

  log.start("Connecting to MCP server...");
  const mcpClient = await createMcpClient();
  const mcpTools = await listMcpTools(mcpClient);
  log.success(`MCP: ${mcpTools.map(t => t.name).join(", ")}`);

  const rl = createReadline();
  const shutdown = onShutdown(() => { logStats(); rl.close(); mcpClient.close(); });

  await runRepl({ mcpClient, mcpTools, rl });
  await shutdown();
};

main().catch((err) => {
  log.error("Startup error", err.message);
  process.exit(1);
});
