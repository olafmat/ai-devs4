export const tools = [
  {
    type: "function",
    name: "start",
    description: "Starts (or restarts) the game. Returns scanner results.",
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
    name: "straight",
    description: "Goes to the same row, next column. Returns scanner results in the new position.",
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
    name: "up",
    description: "Goes to the previous row, next column. Returns scanner results in the new position.",
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
    name: "down",
    description: "Goes to the next row, next column. Returns scanner results in the new position.",
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
    name: "neutralize",
    description: "Neutralizes trap detected by the scanner. Requires frequency and detection code from the scanner.",
    parameters: {
      type: "object",
      properties: {
        frequency: {
          type: "number",
          description: "Frequency returned by the scanner"
        },
        detectionCode: {
          type: "string",
          description: "Detection code returned by the scanner"
        }
      },
      required: ["frequency", "detectionCode"],
      additionalProperties: false
    },
    strict: true
  },
];
