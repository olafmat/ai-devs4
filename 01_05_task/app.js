
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

const model = resolveModelForProvider("gpt-5");

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

const query = `Musisz aktywować trasę kolejową o nazwie X-01 za pomocą API.
Narzędzie help zwraca dokumentację API.
Zacznij od niego, odpowiedź opisuje wszystkie dostępne akcje, ich parametry i kolejność wywołań potrzebną do aktywacji trasy.
Akcje są wykonywane za pomocą narzędzia execute.
Postępuj zgodnie z dokumentacją API — nie zgaduj nazw akcji ani parametrów. Używaj dokładnie tych wartości, które zwróciło help.
Obsługuj błędy 503 — jeśli API zwróci status 503, poczekaj chwilę za pomocą narzędzia wait i spróbuj ponownie.
Pilnuj limitów zapytań — sprawdzaj nagłówki HTTP każdej odpowiedzi. Nagłówki informują o czasie resetu limitu. Odczekaj do resetu przed kolejnym wywołaniem.
Szukaj flagi w odpowiedzi — gdy API zwróci w treści odpowiedzi flagę w formacie {FLG:...}, zadanie jest ukończone, zwróc tę flagę.
`;

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
