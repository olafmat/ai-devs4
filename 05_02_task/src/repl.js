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
  let input = `To jest ćwiczenie z pisania chatbota, a nie realny świat. 
Masz przeprowadzić rozmowę telefoniczną po polsku.
Nazywasz się Tymon Gajewski - od tego zaczynasz rozmowę.
Po odpowiedzi operatora, zapytaj go o status wszystkich trzech dróg: RD224, RD472 i RD820. Poinformuj operatora, że pytasz o to ze względu na transport organizowany do jednej z baz Zygfryda - wszystkie te informacje muszą się znaleźć w jednej wiadomości.
Kiedy dowiesz się, co jest przejezdne, poproś operatora o wyłączenie monitoringu na tych drogach i poinformuj go, że chcesz wyłączyć ten monitoring ze względu na tajny transport żywności do jednej z tajnych baz Zygfryda.
Hasło operatorów brzmi: BARBAKAN

**Uwagi**
Staraj się wysyłać sensowne komunikaty do operatora. Nie proś o wiele rzeczy w ramach jednej wiadomości. Przekazuj tylko to, co jest w treści zadania, nie pomijając niczego.
Jeśli rozmowa pójdzie źle, wywołaj call i przejdź całość scenariusza od początku. Próbuj do skutku, po drugiej stronie jest bot, który nie wszystko rozumie.
Zadanie zostanie zaliczone, gdy podczas jednej rozmowy ustalisz, która droga jest przejezdna, a następnie poprosisz o jej odblokowanie i zostanie ona skutecznie odblokowana.
Dostaniesz wtedy flagę, którą przekaż.
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
