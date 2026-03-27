export const tools = [
  {
    type: "function",
    name: "tool_search",
    description: "Search for available tools",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "List of keywords to search in the tool description"
        },
      },
      required: ["query"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "use_tool",
    description: "Use a tool. A tool will always return up to 3 best fit results",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the tool"
        },
        query: {
          type: "string",
          description: "Query for the tool"
        },
      },
      required: ["name", "query"],
      additionalProperties: false
    },
    strict: true
  },
  /*{
    type: "function",
    name: "calculator",
    description: "Calculates fuel and food consumption for a given route",
    parameters: {
      type: "object",
      properties: {
        route: {
          type: "array",
          description: "Chosen route",
          items: {
            type: "string",
            description: "Vehicle name must go first. Then a list of four directions (right, up, left, down). You can switch to walking using word 'dismount'."
          }
        },
        consumption_of_chosen_vehicle: {
            type: "object",
            properties: {
                fuel: {
                    type: "number",
                    description: "Fuel consumption per move"
                },
                food: {
                    type: "number",
                    description: "Food consumption per move"
                }
            },
            description: "Consumption of a chosen vehicle - get this from another tool",
            required: ["fuel", "food"],
            additionalProperties: false
        },
        consumption_of_walking: {
            type: "object",
            properties: {
                fuel: {
                    type: "number",
                    description: "Fuel consumption per move after dismount"
                },
                food: {
                    type: "number",
                    description: "Food consumption per move after dismount"
                }
            },
            description: "Consumption of walking (used after dismount command) - get this from another tool",
            required: ["fuel", "food"],
            additionalProperties: false
        }
      },
      required: ["route", "consumption_of_chosen_vehicle", "consumption_of_walking"],
      additionalProperties: false
    },
    strict: true
  },*/
  {
    type: "function",
    name: "propose_route",
    description: "Propose an optimal route",
    parameters: {
      type: "object",
      properties: {
        route: {
          type: "array",
          description: "Chosen route",
          items: {
            type: "string",
            description: "Vehicle name must go first. Then a list of four directions (right, up, left, down). You can switch to walking using word 'dismount'."
          }
        }
      },
      required: ["route"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "wait",
    description: "Wait (used in case the server limits are exceeded)",
    parameters: {
      type: "object",
      properties: {
        milliseconds: {
          type: "number",
          description: "Number of milliseconds to wait"
        },
      },
      required: ["milliseconds"],
      additionalProperties: false
    },
    strict: true
  }
];
