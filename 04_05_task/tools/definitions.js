export const tools = [
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
  }
];
