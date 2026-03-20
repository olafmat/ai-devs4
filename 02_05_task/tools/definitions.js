export const tools = [
  {
    type: "function",
    name: "get_documentation",
    description: "Read API documentation",
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
    name: "fly",
    description: "Execute specific series of the drone instructions.",
    parameters: {
      type: "object",
      properties: {
        instructions: {
          type: "array",
          items: {
            type: "string",
            description: "Instruction for a drone (see documentation)"
          },
          description: "List of the past locations of a person"
        },
      },
      required: ["instructions"],
      additionalProperties: false
    },
    strict: true
  }
];
