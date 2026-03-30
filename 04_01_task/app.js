
import {
  AI_API_KEY,
  AIDEVS_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
  OKO_URL
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

handlers.agent_browser({command: "install"});
handlers.agent_browser({command: "close --all"});

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
  if (!response.ok) {
    console.log(body);
    console.log(data);
    throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  }
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

const query = `Twoim zadaniem jest wprowadzenie zmian w Centrum Operacyjnym OKO za pomocą API wystawionego przez centralę.
Do odczytu używasz browsera agent_browser dla adresu ${OKO_URL} z parametrami logowania:
Login: "Zofia"
Hasło: "Zofia2026!"
32-znakowe id: "${AIDEVS_KEY}". This is also YOUR_API_KEY in edit_execute function parameters.
Zanim zaczniesz z niego korzystać, przeczytaj jego dokumentację - funkcja agent_browser_help.
Do zmian nie wolno używać browsera, lecz dodatkowego API - funkcje edit_help, edit_execute.
Oto Twoja lista zadań:
1. Zmień klasyfikację raportu o mieście Skolwin tak, aby nie był to raport o widzianych pojazdach i ludziach, a o zwierzętach.
2. Na liście zadań znajdź zadanie związane z miastem Skolwin i oznacz je jako wykonane. W jego treści wpisz, że widziano tam jakieś zwierzęta np. bobry.
3. Spraw, aby na liście incydentów pojawił się raport o wykryciu ruchu ludzi w okolicach miasta Komarowo.
4. Gdy wprowadzisz wszystkie wymagane zmiany na stronie, wykonaj akcję done przez edit_execute.
Szukaj flagi w odpowiedziach — gdy API zwróci w treści odpowiedzi flagę w formacie {FLG:...}, na koniec zwróc tę flagę.
Poszukaj również jakichkolwiek wzmianek o Mickiewiczu lub Miłoszu lub ciszy.`;

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);

handlers.agent_browser({command: "close --all"});
