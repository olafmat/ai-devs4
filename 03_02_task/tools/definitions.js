export const tools = [
  {
    type: "function",
    name: "help",
    description: "List available Unix commands",
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
    description: "Execute specific shell command.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Unix command to run"
        }
      },
      required: ["command"],
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
