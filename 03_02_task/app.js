
import {
  AI_API_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
} from "../config.js";
import {
  buildNextConversation,
  getFinalText,
  getToolCalls,
  logAnswer,
  logQuestion,
} from "../helpers.js";
import {
  tools,
  handlers
} from "./tools/index.js";

const model = resolveModelForProvider("anthropic/claude-sonnet-4-6");

// `buildResponsesRequest()` maps this to OpenAI web search or OpenRouter online mode.
const webSearch = true;


/* Step 3: Send messages + tool definitions to the Responses API */
const requestResponse = async (input) => {
  const body = buildResponsesRequest({
    model,
    input,
    tools,
    webSearch,
  });

  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  console.log(data);
  return data;
};

const MAX_TOOL_STEPS = 100;

const chat = async (conversation) => {
  let currentConversation = conversation;
  let stepsRemaining = MAX_TOOL_STEPS;

  while (stepsRemaining > 0) {
    stepsRemaining -= 1;

    const response = await requestResponse(currentConversation);
    const toolCalls = getToolCalls(response);

    if (toolCalls.length === 0) {
      return getFinalText(response);
    }

    currentConversation = await buildNextConversation(currentConversation, toolCalls, handlers);
  }

  throw new Error(`Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`);
};

const query = `Masz dostęp do konsoli systemu podobnego do Unix.
Twoim zadaniem jest uruchomić oprogramowanie sterownika, które wrzuciliśmy do maszyny wirtualnej.
Nie wiemy, dlaczego nie działa ono poprawnie.
Operujesz w bardzo ograniczonym systemie Linux z dostępem do kilku komend.
Większość dysku działa w trybie tylko do odczytu, ale na szczęście wolumen z oprogramowaniem zezwala na zapis.
Oprogramowanie, które musisz uruchomić znajduje się na wirtualnej maszynie w tej lokalizacji: /opt/firmware/cooler/cooler.bin
Gdy poprawnie je uruchomisz (w zasadzie wystarczy tylko podać ścieżkę do niego), na ekranie pojawi się specjalny kod, który musisz dać w odpowiedzi.
Kod, którego szukasz, ma format: ECCS-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Hasło dostępowe do tej aplikacji zapisane jest w kilku miejscach w systemie.
Zastanów się, jak możesz przekonfigurować to oprogramowanie (settings.ini), aby działało poprawnie.
Pracujesz na koncie zwykłego użytkownika
Nie wolno Ci zaglądać do katalogów /etc, /root i /proc/
Jeśli w jakimś katalogu znajdziesz plik .gitignore to respektuj go. Nie wolno Ci dotykać plików i katalogów, które są tam wymienione.
Niezastosowanie się do tych zasad skutkuje zablokowaniem dostępu do API na pewien czas i przywróceniem maszyny wirtualnej do stanu początkowego.
Jeśli uznasz, że zbyt mocno namieszałeś w systemie, użyj funkcji reboot.
Zacznij od funkcji help. Shell API na tej maszynie wirtualnej ma niestandardowy zestaw komend.
Nie zakładaj, że wszystkie standardowe polecenia Linuxa zadziałają. Szczególnie edycja pliku odbywa się inaczej niż w standardowym systemie.`;

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
