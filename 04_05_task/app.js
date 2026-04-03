
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

const model = resolveModelForProvider("gpt-5.4");

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
  //console.log(data);
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

const query = `
Listę wszystkich narzędzi z parametrami dostaniesz przez:
{"answer":"{\"tool\": \"help\"}"}
Najważniejsze narzędzia:
* orders - odczyt, tworzenie, uzupełnianie i usuwanie zamówień
* signatureGenerator - generowanie podpisu SHA1 na podstawie danych użytkownika z bazy SQLite
* database - odczyt danych i schematów z bazy SQLite
* reset - przywrócenie początkowego stanu zamówień
* done - końcowa weryfikacja rozwiązania

Nowe zamówienie tworzysz dopiero wtedy, gdy znasz już tytuł, creatorID, kod destination oraz poprawny podpis:
{"answer": "{\"tool\\": \\"orders\\",\\"action\\": \\"create\\",\\"title\\": \\"Dostawa dla Torunia\\",\\"creatorID\\": 2,\\"destination\\": \\"1234\\",\\"signature\\": \\"tutaj-podpis-sha1\\"}"}

Po utworzeniu zamówienia możesz dopisywać towary pojedynczo przez 'append'.
Możesz też użyć batch mode i dopisać wiele pozycji naraz. To ważne, bo orders.append przyjmuje również obiekt z wieloma towarami
Jeżeli dopiszesz do zamówienia towar, który już w nim istnieje, system zwiększy jego ilość zamiast tworzyć duplikat.
Możesz sprawdzić, jakie tabele znajdują się w bazie SQLite:
{"answer":  "{\"tool\": \"database\",\"query\": \"show tables\"}"}

Możesz też wykonywać zapytania select.
Co musisz zrobić:
* Ustal, które miasta biorą udział w operacji na podstawie pliku food4cities.json
* Znajdź odpowiednie wartości dla pola destination dla tych miast
* Odczytaj z food4cities.json, jakie towary i ilości są potrzebne w każdym z tych miast
* Przygotuj osobne zamówienie dla każdego wymaganego miasta
* Każde zamówienie utwórz z poprawnym creatorID, destination i podpisem wygenerowanym na podstawie danych z bazy SQLite
* Uzupełnij zamówienia dokładnie tymi towarami, których potrzebują miasta. Bez braków i bez nadmiarów
* Gdy wszystko będzie gotowe, wywołaj narzędzie done. Powinieneś dostać flagę, zwróć ją.
Dodatkowe uwagi:
* Musisz utworzyć tyle zamówień, ile mamy miast w pliku JSON
* Jeśli coś zepsujesz po drodze, użyj reset, żeby wrócić do stanu początkowego
* Każde zamówienie musi mieć poprawny creatorID oraz signature
Po drodze możesz znaleźć sekretną flagę lub wskazówki do jej otrzymania. Wiadomo o niej tyle że nazywa się "Nie jestem za stary na VibeCodera?".
Zapamiętaj ją i podaj na koniec.
`;

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
