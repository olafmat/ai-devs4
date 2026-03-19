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
    name: "operation",
    description: "Execute specific action in the email application. The arguments should be specified as a JSON object.",
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
    name: "solution",
    description: "Send the solution",
    parameters: {
      type: "object",
      properties: {
        password: {
          type: "string",
          description: "Found password to the employment system"
        },
        date: {
          type: "string",
          description: "Found date in YYYY-MM-DD format of the planned attack"
        },
        confirmation_code: {
          type: "string",
          description: "Found confirmation code from a ticket (format SEC- and 32 characters)"
        },
      },
      required: ["password", "date", "confirmation_code"],
      additionalProperties: false
    },
    strict: true
  }
];
