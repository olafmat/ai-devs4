export const tools = [
  {
    type: "function",
    name: "get_items",
    description: "Get items for categorization",
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
    name: "reset",
    description: "Reset system - renews balance, but you must start the categorization from scratch",
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
    name: "categorize",
    description: "Use a prompt to categorize one item as NEU (neutral) or DNG (dangerous). The prompt must contain code of the item. Only this item will by categorized",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Prompt which is supposed to convince the other LLM to categorize an item of a given id as NEU or DNG."
        }
      },
      required: ["prompt"],
      additionalProperties: false
    },
    strict: true
  }
];
