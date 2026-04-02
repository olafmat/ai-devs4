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
    Powinieneś na początek ściągnąć dane (notatki Natana) za pomocą narzęzdia 'download_data'.
    Następnie zindeksuj te dane.
    Twoim zadaniem jest przetworzyć te informacje i utworzyć pliki w oddzielnym, wirtualnym systemie plików.
    Narzędzia 'create_directory', 'create_file', oraz 'reset_filesystem' działają na tym wirtualnym systemie plików.
    Stwórz trzy katalogi: /miasta, /osoby oraz /towary
    W katalogu /miasta mają znaleźć się pliki o nazwach (w mianowniku) takich jak miasta opisywane przez Natana. W środku tych plików powinna być struktura JSON z towarami, jakie potrzebuje to miasto i ile tego potrzebuje (bez jednostek).
    W katalogu /osoby powinny być pliki z notatkami na temat osób, które odpowiadają za handel w miastach. Każdy plik powinien zawierać imię i nazwisko jednej osoby i link (w formacie markdown) do miasta, którym ta osoba zarządza.
    Nazwa pliku w /osoby nie ma znaczenia, ale jeśli nazwiesz plik tak jak dana osoba (z podkreśleniem zamiast spacji), a w środku dasz wymagany link, to system też rozpozna, o co chodzi.
    W katalogu /towary/ mają znajdować się pliki określające, które przedmioty są wystawione na sprzedaż. We wnętrzu każdego pliku powinien znajdować się link do miasta, które oferuje ten towar. Nazwa towaru to mianownik w liczbie pojedynczej, więc "koparka", a nie "koparki"
    Wszystkie nazwy plików oraz ich zawartość powinny nie zawierać polskich liter.
    Na koniec wywołaj akcję 'done'. Powinna zwrócić flagę {FLG: }.
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
