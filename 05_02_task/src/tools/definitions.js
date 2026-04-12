export const tools = [
  {
    type: "function",
    name: "call",
    description: "Starts a phone call",
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
    name: "say",
    description: "Says something and receives answer",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Message that will be converted to voice"
        }
      },
      required: ["text"],
      additionalProperties: false
    },
    strict: true
  }
];
