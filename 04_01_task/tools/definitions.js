import { OKO_URL } from "../../config.js";

export const tools = [
  {
    type: "function",
    name: "edit_help",
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
    name: "edit_execute",
    description: "Execute specific edit action with any arguments. The arguments should be specified as a JSON object.",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          description: `JSON with the operation`
        }
      },
      required: ["operation"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "agent_browser_help",
    description: "Shows documentation of the agent_browser",
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
    name: "agent_browser",
    description: `Execute specific agent_browser command. It can only open pages inside ${OKO_URL}`,
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: `
              Text after "agent_browser", for example to open URL ${OKO_URL}, you need to use command "open ${OKO_URL}".
              In order to get html use "snapshot".
              In order to click an element listed as "ref=e1" use "click  e1".
              All commands are available with function agent_browser_help.`
        }
      },
      required: ["command"],
      additionalProperties: false
    },
    strict: true
  }
];
