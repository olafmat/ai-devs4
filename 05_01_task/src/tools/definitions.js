export const tools = [
  {
    type: "function",
    name: "listen",
    description: "Retrieve one result from the radio monitoring. It can return text, image, json, or audio. Data are automatically saved on the disk.",
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
    name: "sendAnswer",
    description: "Once you have the answer, send it here. You should receive a flag.",
    parameters: {
      type: "object",
      properties: {
        cityName: {
          type: "string",
          description: "Real name of the city called Syjon"
        },
        cityArea: {
          type: "string",
          description: "Area of Syjon, rounded to two digits after the decimal dot, for example 12.34. It must have exactly two digits after the dot."
        },
        warehousesCount: {
          type: "number",
          description: "Number of warehouses in Syjon"
        },
        phoneNumber: {
          type: "string",
          description: "contact number to a person in Syjon, for example 123456567"
        }
      },
      required: ["cityName", "cityArea", "warehousesCount", "phoneNumber"],
      additionalProperties: false
    },
    strict: true
  }
];
