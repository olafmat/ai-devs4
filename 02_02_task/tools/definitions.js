export const tools = [
  {
    type: "function",
    name: "rotate",
    description: "Rotate one of the 9 squares clockwise by 90 degree",
    parameters: {
      type: "object",
      properties: {
        row: {
          type: "number",
          description: "row number (1, 2, or 3)"
        },
        column: {
          type: "number",
          description: "column number (1, 2, or 3)"
        }
      },
      required: ["row", "column"],
      additionalProperties: false
    },
    strict: true
  }
];
