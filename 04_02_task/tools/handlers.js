import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";
import {
  getToolCalls
} from "../../helpers.js";

let waiting = 0;
let initialized = false;
let wasWeather = false;

const execute1 = async (operation, silent) => {
  try {
    const body = {
      apikey: AIDEVS_KEY,
      task: "windpower",
      answer: operation
    };
    if (!silent)
        console.log(JSON.stringify(body));
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const result = {
        status: response.status,
        data
    }
    if (!silent)
        console.log(JSON.stringify(result));
    return result;
  } catch (ex) {
    return {error: ex.message}
  }
};

const execute = async (operation, silent) => {
  if (!initialized) {
    initialized = true;
    await execute1({
        action: "start"
    })
  }
  return await execute1(operation, silent);
};

export const handlers = {
  async get({param}) {
    if (param === 'weather') {
        if (wasWeather) {
            return {error: "Weather has been scheduled yet!"}
        }
        wasWeather = true;
    }
    if (param !== 'documentation') {
        waiting++;
    }
    let res = await execute({
        action: "get",
        param
    });
    if (param === 'weather') {
        console.log(`msg: ${res.data.message}`);
        res.data.message = "Task has been queued."
        console.log(`after: ${res.data.message}`);
    }
    return res;
  },

  async unlockCodeGenerator({configs}) {
    for (const {startDate, startHour, windMs, pitchAngle} of configs) {
        waiting++;
        await execute({
            action: "unlockCodeGenerator",
            startDate,
            startHour: `${startHour < 10 ? '0' : ''}${startHour}:00:00`,
            windMs,
            pitchAngle
        });
    };
    return {status: `Generation of ${waiting} unlock codes scheduled`}
  },

  async config({configs}) {
    let items = {};
    for (const config of configs) {
        items[`${config.startDate} ${config.startHour < 10 ? '0' : ''}${config.startHour}:00:00`] = {
            pitchAngle: config.pitchAngle,
            turbineMode: config.turbineMode,
            unlockCode: config.unlockCode
        }
    }
    return await execute({
        action: "config",
        configs: items
    });
  },

  async getResult() {
    console.log(`getResult ${waiting}`)
    if (waiting === 0) {
        return {error: "You must first use an operation which schedules some data. For example get, unlockCodeGenerator"}
    }
    let out = [];
    while (waiting > 0) {
        for (let i = 0; i < 400; i++) {
            const result = await execute({
                action: "getResult"
            }, true);
            if (result.status !== 200 || result.data.code !== 11) {
                waiting --;
                if (result.data.forecast) {
                    result.data.unit = undefined;
                    result.data.forecast = result.data.forecast.map(day => {
                        return {
                            startDate: day.timestamp.substring(0,10),
                            startHour: parseInt(day.timestamp.substring(11,13)),
                            windMs: day.windMs
                        }
                    })
                }
                console.log(JSON.stringify(result));
                out.push(result);
                break;
            }
            await setTimeout(100);
        }
    }
    return {results: out};
  },

  async getPlan(params) {
    console.log(`getPlan ${waiting}`)
    if (waiting === 0) {
        return {error: "You must first use an operation which schedules some data. For example get, unlockCodeGenerator"}
    }
    let out = [];
    while (waiting > 0) {
        for (let i = 0; i < 400; i++) {
            const result = await execute({
                action: "getResult"
            }, true);
            if (result.status !== 200 || result.data.code !== 11) {
                waiting --;
                if (result.data.forecast) {
                    result.data.unit = undefined;
                    result.data.forecast = result.data.forecast.map(day => {
                        return {
                            startDate: day.timestamp.substring(0,10),
                            startHour: parseInt(day.timestamp.substring(11,13)),
                            windMs: day.windMs
                        }
                    })
                    result.data.plan = (await handlers.planner({...params, forecast: result.data.forecast})).plan;
                    result.data.forecast = undefined;
                }
                out.push(result);
                break;
            }
            await setTimeout(100);
        }
    }
    console.log("Returned:");
    console.log(JSON.stringify(out));
    return {results: out};
  },

  async planner({minOperationalWindMs, cutoffWindMs, forecast}) {
    let out = [];
    let lastPlan = "start";
    let produced = false;
    console.log(JSON.stringify(forecast));
    for (let i = 0; i < forecast.length; i++) {
        const state = forecast[i];
        let plan = state.windMs < minOperationalWindMs ? 'maximize energy capture'
            : state.windMs > cutoffWindMs ? 'shut down turbine'
            : 'produce energy';
        if (plan !== lastPlan && (plan !== 'produce energy' || !produced)) {
            out.push({
                startDate: state.startDate,
                startHour: state.startHour,
                windMs: state.windMs,
                plan
            })
            lastPlan = plan;
            if (plan === 'produce energy') {
                produced = true;
            }
        }
    }
    out = out.filter(day => day.plan !== 'maximize energy capture');
    console.log("Plan:");
    console.log(JSON.stringify(out));
    return {plan: out};
  },

  async done() {
    await handlers.get({param: "turbinecheck"})
    await handlers.getResult();
    const res = await execute({
        action: "done"
    });
    console.log(JSON.stringify(res));
    return res;
  },

  async restart() {
    waiting = 0;
    initialized = false;
    wasWeather = false;
    return {restart: "done"};
  },

  async spawnAgents({agents}) {
    const promises = agents.map(agent =>
        async () => {
          const requestResponse = async (input) => {
              const body = buildResponsesRequest({
                model,
                input,
                tools: tools.filter(tool => name !== 'spawnAgents' && name !== 'start' && name !== 'done'),
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
                return {error: data?.error?.message ?? `Request failed (${response.status})`};
              }
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

            return {error: `Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`};
          };

          const result = {agentId: id, prompt, answer: await chat([{ role: "user", content: prompt }])};
          console.log("Agent finished")
          console.log(result);
          return result;
        });

    console.log("Waiting for all agents");
    return {results: await Promise.all(promises)};
  }
};
