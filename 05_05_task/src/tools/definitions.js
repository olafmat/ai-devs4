import { HUB_URL } from "../../../config.js";

export const tools = [
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
    description: `Execute specific agent_browser command`,
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: `
              Text after "agent_browser", for example to open URL ${HUB_URL}, you need to use command "open ${HUB_URL}".
              In order to get html use "snapshot".
              In order to click an element listed as "ref=e1" use "click  e1".
              All commands are available with function agent_browser_help.`
        }
      },
      required: ["command"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "execute",
    description: "Executes Javascript code in vm.runInNewContext from node:vm module",
    parameters: {
      type: "object",
      properties: {
        javaScriptCode: {
          type: "string",
          description: "Javascript code to run. It will be executed in the provided context. It should set variables in the current scope. The variables will be returned from the execute tool. For example code 'name = \"kitty\"' returns context {name: \"kitty\"}"
        },
        context: {
          type: "string",
          description: "JSON with the object with the initial values of variables provided for the code."
        }
      }
    }
  },
  {
    type: "function",
    name: "apiHelp",
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
    name: "apiExecute",
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
    name: "waitForMode",
    description: "Waits until internal mode has desired value",
    parameters: {
      type: "object",
      properties: {
        internalMode: {
          type: "number",
          description: "Desired internal mode"
        }
      }
    }
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
