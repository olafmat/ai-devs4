export const tools = [
  {
    type: "function",
    name: "help",
    description: "List possible actions and their parameters",
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
    name: "execute",
    description: "Execute specific action with any additional arguments. The arguments should be specified as a JSON object. If the result status is 429, you need to wait. For any result other than 200 you should repeat after some pause.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the action, as returned by the help function"
        },
        arguments: {
          type: "string",
          description: "JSON with arguments of the action"
        }
      },
      required: ["name", "arguments"],
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
