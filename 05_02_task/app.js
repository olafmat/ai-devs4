import { createReadline, runRepl } from "./src/repl.js";
import { onShutdown } from "./src/helpers/shutdown.js";
import { logStats } from "./src/helpers/stats.js";
import log from "./src/helpers/logger.js";

const main = async () => {
  const rl = createReadline();
  const shutdown = onShutdown(() => { logStats(); rl.close(); });

  await runRepl({ rl });
  await shutdown();
};

main().catch((err) => {
  log.error("Startup error", err.message);
  process.exit(1);
});
