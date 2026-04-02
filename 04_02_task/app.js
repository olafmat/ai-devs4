
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

const model = resolveModelForProvider("gpt-5-mini");

const webSearch = true;

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

const query = `Your goal is to protect the wind turbine when the wind is too strong by changing the pitch angle,
and also find a moment when the energy can be safely generated and set the appropriate pitch angle.
You have only 40 seconds for the task, and some operations take even 25 seconds.

The plan:
1. request weather using "get". The plan based on the weather will be available later.
2. get the documentation using "get".
3. find in the documentation what wind is strong and what conditions are suitable to produce energy
4. get the plan of action using "getPlan".
5. use "restart" function to restart the timer
6. request codes using "unlockCodeGenerator" for all dates, hours and wind speeds in the plan.
Don't request anything which is not in the plan from point 4. Use only pitchAngle 0 or 90
7. get the codes using "getResult"
8. use "config" to reconfigure the turbine
9. get the results using "getResult"
10. use function "done".
If you spend too much time, and you won't fit in the window, use "restart" and start from the beginning.
This resets the turbine state. The data are the same, so you don't need to request them again.
Don't request weather twice! Even after restart. Don't ask user what to do.
`

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
