
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

const query = `Masz dostęp do shella systemu unix. Jest on jednak całkowicie read-only, nie działa też polecenie cd.
Wydobądź z plików informacje: kiedy znaleziono ciało Rafała. W jakim mieście się to wydarzyło oraz jakie są współrzędne tego miejsca.
Musisz wyszukać datę, kiedy odnaleziono Rafała, i podać datę dzień wcześniej.
Wypisz na ekran (komendami powłoki) plik JSON w formacie jak podany niżej
{
  "date": "2020-01-01",
  "city": "nazwa miasta",
  "longitude": 10.000001,
  "latitude": 12.345678
}

System sam wykryje, czy dane są prawidłowe i odeśle Ci flagę {FLG:...}.
Zadanie nie jest poprawnie wykonane, dopuki nie dostaniesz flagi.
`;

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
