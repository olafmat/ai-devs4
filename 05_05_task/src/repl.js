import { HUB_URL } from "../../config.js";

/**
 * Interactive REPL for the audio processing agent.
 */

import * as readline from "readline/promises";
import { run } from "./agent.js";
import { resetStats } from "./helpers/stats.js";
import log from "./helpers/logger.js";

export const createReadline = () => 
  readline.createInterface({ input: process.stdin, output: process.stdout });

export const runRepl = async ({ rl }) => {
  let history = [];
  let input = `Jesteś asystentem operatora wehikułu w czasie.
  Odczytaj dokumentację modułu do podróży w czasie spod adresu https://${HUB_URL}/dane/timetravel.md
  Stwórz i zapamiętaj kod JavaScript do wyliczania syncRatio dla wybranej daty, który będziesz uruchamiał za pomocą toola 'execute'.
  Po ustawieniu przez użytkownika pełnej daty pobierz z API wskazówki dotyczące stabilization i na ich podstawie ustaw poprawną wartość.
  Sprawdzaj aktualny stan urządzenia przez getConfig.
  API pozwala konfigurować day, month, year, syncRatio i stabilization. Ty się tym zajmujesz.
  Operator może natomiast ustawiać PT-A, PT-B i PWR.
  Podpowiadaj operatorowi, kiedy internalMode przyjął właściwą wartość, bo tego parametru nie da się ustawić ręcznie.
  Informowuj użytkownika, jakie ustawienia w preview trzeba zmienić ręcznie przed kolejnym skokiem.
  `;

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
      const result = await run(input, { conversationHistory: history });
      history = result.conversationHistory;
      console.log(`\nAssistant: ${result.response}\n`);
    } catch (err) {
      log.error("Error", err.message);
      console.log("");
    }

    input = await rl.question("You: ").catch(() => "exit");
  }
};
