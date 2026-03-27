
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

const model = resolveModelForProvider("anthropic/claude-sonnet-4.6" /*"gpt-5.4"*/);

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
  if (!response.ok) {
    console.log(body);
    console.log(response);
    throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  }
  // console.log(data);
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

const query = `You need to find an optimal route to get to the goal in the city of Skolwin
Map and vehicle parameters can be obtained from the available tools.
The vehicle needs fuel, the driver needs food. Faster vehicles consume more fuel, but you will need less food.
You have only 10 units of food and 10 units of fuel available, so try to find the optimal route
with a stricter coordinate-by-coordinate search strategy, and use exactly the smallest number of moves.
You can always get off the vehicle and walk ('dismount' in a route).

The plan:
1. Find the needed tools
2. Find the map of Skolwin. Maps are always 10x10 squares. On a map "S" means "start", "G" means "goal", "R" is "rock", "T" is "tree", "W" is "water".
3. Find the available vehicles
4. Find the properties of each vehicle (food consumption, fuel consumption and if it can pass the river)
5. Try to calculate difference from start to the goal in X and Y coordinates. You should use at most diff(X) + diff(Y) moves.
6. Try various routes. Go only up and right. Trees should be avoided, because they consume more fuel.
Not all vehicles can pass the river, so you may either choose a vehicle which can do it, or move to the bank of the river, dismount there and swim to the goal.
7. Once the route is computed, send it to 'propose_route' function.

You may get a flag or two in the form of {FLG:......}. Output them once you complete the whole task.
The task is possible to obtain, if you failed, your route is not optimal enough.
`;
//If you find beavers on a map, visit them first.

logQuestion(query);

const answer = await chat([{ role: "user", content: query }]);
logAnswer(answer);
