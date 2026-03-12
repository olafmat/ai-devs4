export const tools = [
  {
    type: "function",
    name: "check_package",
    description: "Checks status of a given package",
    parameters: {
      type: "object",
      properties: {
        packageid: {
          type: "string",
          description: "ID of the package"
        },
      },
      required: ["packageid"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "redirect_package",
    description: "Redirects package",
    parameters: {
      type: "object",
      properties: {
        packageid: {
          type: "string",
          description: "ID of the package"
        },
        destination: {
          type: "string",
          description: "ID of the destination power plant"
        },
        code: {
          type: "string",
          description: "Security code provided by human"
        },
      },
      required: ["packageid", "destination", "code"],
      additionalProperties: false
    },
    strict: true
  }
];
