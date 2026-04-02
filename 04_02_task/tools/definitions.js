import { OKO_URL } from "../../config.js";

export const tools = [
  {
    type: "function",
    name: "get",
    description: `Requests task data. Documentation is returned directly.
        For weather, turbinecheck, and powerplantcheck use getResult to fetch final response.
        It may take a lot of time, so send as many get requests as you need before you start getResult`,
    parameters: {
      type: "object",
      properties: {
         param: {
            type: "string",
            enum: ["weather", "turbinecheck", "powerplantcheck", "documentation"],
            description: "Requests task data. For weather, turbinecheck, and powerplantcheck use getResult to fetch final response. Documentation is returned directly."
         }
      },
      required: ["param"],
      additionalProperties: false
    },
    strict: true
  },
  {
      type: "function",
      name: "unlockCodeGenerator",
      description: `Generates unlockCode signature for given configurations. Result is asynchronous and must be collected with getResult.`,
      parameters: {
        type: "object",
        properties: {
            configs: {
                type: "array",
                description: "Array of config items",
                items: {
                    type: "object",
                    properties: {
                        startDate: {
                            type: "string",
                            description: "Start date in format: YYYY-MM-DD"
                        },
                        startHour: {
                            type: "number",
                            description: "Start hour"
                        },
                        windMs: {
                            type: "number"
                        },
                        pitchAngle: {
                            type: "number"
                        }
                    },
                    required: ["startDate", "startHour", "windMs", "pitchAngle"],
                    additionalProperties: false
                }
            }
        },
        required: ["configs"],
        additionalProperties: false
      },
      strict: true
  },
  {
    type: "function",
    name: "config",
    description: `Scheduling config points.`,
    parameters: {
      type: "object",
      properties: {
        configs: {
            type: "array",
            description: "Array of config points",
            items: {
                type: "object",
                properties: {
                    startDate: {
                        type: "string",
                        description: "Start date in format: YYYY-MM-DD"
                    },
                    startHour: {
                        type: "number",
                        description: "Start hour"
                    },
                    pitchAngle: {
                        type: "number"
                    },
                    turbineMode: {
                        type: "string",
                        enum: ["idle", "production"],
                        description: "'production' enables generation, 'idle' disables turbine"
                    },
                    unlockCode: {
                        type: "string",
                        description: "md5 signature from unlockCodeGenerator. unlockCode is required for every point"
                    }
                },
                required: ["startDate", "startHour", "pitchAngle", "turbineMode", "unlockCode"],
                additionalProperties: false
            }
        }
      },
      required: ["configs"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "getResult",
    description:
        `Returns completed queued response with sourceFunction field. Retrieved items are removed from queue.
        Don't use it for weather. Use getPlan instead.`,
    parameters: {
        type: "object",
        properties: {
        },
        required: [],
        additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "getPlan",
    description:
        `Retrieves weather forecast if it was scheduled and produces a detailed plan.
        Don't use this function if there are no results to wait for'`,
    parameters: {
        type: "object",
        properties: {
            minOperationalWindMs: {
                type: "number",
                description: "Minimum wind speed for a turbine to operate"
            },
            cutoffWindMs: {
                type: "number",
                description: "Maximum wind speed for a turbine to operate"
            },
            shutdownAngle: {
                type: "number",
                description: "Angle to disable electricity production and protect against strong wind"
            },
            productionAngle: {
                type: "number",
                description: "Angle for maximizing of electricity production"
            }
        },
        required: ["minOperationalWindMs", "cutoffWindMs", "shutdownAngle", "productionAngle"],
        additionalProperties: false
    },
    strict: true
  },
  /*{
    type: "function",
    name: "planner",
    description: `Processes weather forecast from "getResult" function and produces a detailed plan`,
    parameters: {
        type: "object",
        properties: {
            minOperationalWindMs: {
                type: "number",
                description: "Minimum wind speed for a turbine to operate"
            },
            cutoffWindMs: {
                type: "number",
                description: "Maximum wind speed for a turbine to operate"
            },
            forecast: {
                type: "array",
                description: "Weather forecast from getResult function",
                items: {
                    type: "object",
                    properties: {
                        startDate: {
                            type: "string",
                            description: "Start date in format YYYY-MM-SS"
                        },
                        startHour: {
                            type: "number",
                            description: "Start hour"
                        },
                        windMs: {
                            type: "number",
                            description: "Wind speed"
                        }
                    },
                    required: ["startDate", "startHour", "windMs"],
                    additionalProperties: false
                }
            }
        },
        required: ["minOperationalWindMs", "cutoffWindMs", "forecast"],
        additionalProperties: false
    },
    strict: true
  },*/
  {
    type: "function",
    name: "done",
    description: `Validates final configuration and returns flag on success.`,
    parameters: {
      type: "object",
      properties: {
      },
      required: [],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "restart",
    description: "Restarts a new service window and resets task state. Should be called when the time was exceeded to start from the beginning",
    parameters: {
      type: "object",
      properties: {
      },
      required: [],
      additionalProperties: false
    },
    strict: true
  }
  /*
  {
    type: "function",
    name: "spawnAgents",
    description: `Spawn asynchronous agents and returns results when all finish.
        Agents can call all functions except "spawnAgents", "start" and "done"`,
    parameters: {
      type: "object",
      properties: {
        agents: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Agent id"
                    },
                    prompt: {
                        type: "string",
                        description: "Prompt for an agent"
                    }
                },
                required: ["id", "prompt"],
                additionalProperties: false
            }
        }
      },
      required: ["agents"],
      additionalProperties: false
    },
    strict: true
  }*/
];
