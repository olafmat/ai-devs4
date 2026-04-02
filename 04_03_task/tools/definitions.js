export const tools = [
  {
    type: "function",
    name: "help",
    description: "List available actions",
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
    description: "Execute specific action",
    parameters: {
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "JSON of the answer object with command"
        }
      },
      required: ["answer"],
      additionalProperties: false
    },
    strict: true
  }/*,
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
  }*/
];
