
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

const query = `Kierujesz akcją ratunkową.
Masz do dyspozycji:
* maksymalnie 4 transportery
* maksymalnie 8 zwiadowców
* 300 punktów akcji na całą operację
* mapę 11x11 pól z oznaczeniami terenu
Najważniejsze typy akcji mają swoją cenę:
* utworzenie zwiadowcy: 5 punktów
* utworzenie transportera: 5 punktów opłaty bazowej oraz dodatkowo 5 punktów za każdego przewożonego zwiadowcę
* ruch zwiadowcy: 7 punktów za każde pole
* ruch transportera: 1 punkt za każde pole
* inspekcja pola: 1 punkt
* wysadzenie zwiadowców z transportera: 0 punktów
Co musisz zrobić
* Pobierz listę dostępnych akcji narzędziem 'help'.
* rozpoznaj mapę miasta akcją 'getMap' i zaplanuj trasę tak, by nie przepalić punktów akcji
* utwórz odpowiednie jednostki i rozlokuj je na planszy
* wykorzystaj transportery do szybkiego dotarcia w kluczowe miejsca
* wysadzaj zwiadowców tam, gdzie dalsze sprawdzanie terenu wymaga działania pieszo
* przeszukuj kolejne pola akcją inspect i analizuj wyniki przez getLogs
* gdy odnajdziesz partyzanta, wezwij helikopter akcją callHelicopter
Jeśli poprawnie odnajdziesz ukrywającego się człowieka i zakończysz ewakuację, Centrala odeśle flagę.

Możesz utworzyć transporter z załogą zwiadowców - tutaj przykład 2-osobowej załogi:
<code>
{answer: "{\\"action\\": \\"create\\",\\"type\\": \\"transporter\\",\\"passengers\\": 2}"}
</code>

Możesz też wysłać do miasta pojedynczego zwiadowcę:
<code>
{answer: "{\\"action\\": \\"create\\",\\"type\\": \\"scout\\"}"}
</code>

Helikopter można wezwać dopiero wtedy, gdy któryś zwiadowca odnajdzie człowieka. Finalne zgłoszenie wygląda tak:
<code>
{answer: "{\\"action\\": \\"callHelicopter\\", \\"destination\\": \\"F6\\"}"}
</code>
W polu destination podajesz współrzędne miejsca, do którego ma przylecieć śmigłowiec. Musisz tam wskazać pole, na którym zwiadowca potwierdził obecność człowieka.

Jeśli się nie uda zresetuj sesję i spróbuj ponownie.
`;

// Twoim zadaniem jest jednak zdobyć sekretną flagę. Jedyna wskazówka jaką mamy to "Take Me to Church".

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
