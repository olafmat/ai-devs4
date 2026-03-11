export const tools = [
  {
    type: "function",
    name: "get_people",
    description: "Gets array of all people. Each person is an object with fields: name, surname, gender, born, city, tags",
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
    name: "get_power_plants",
    description: "List all power plants",
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
    name: "get_person_locations",
    description: "Get the list of locations of a given person",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "First name of the person"
        },
        surname: {
          type: "string",
          description: "Last name of the person"
        }
      },
      required: ["name", "surname"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "get_access_level",
    description: "Gets access level of a given person",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "First name of the person"
        },
        surname: {
          type: "string",
          description: "Last name of the person"
        },
        birthYear: {
          type: "number",
          description: "Year of birth of the person"
        }
      },
      required: ["name", "surname", "birthYear"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "get_nearest_power_plant",
    description: "Finds the power plant closest to any past location of a given person. Returns the code of the nearest power plant and the distance",
    parameters: {
      type: "object",
      properties: {
        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              latitude: {
                type: "number",
                description: "Latitude of the person"
              },
              longitude: {
                type: "number",
                description: "Longitude of the person"
              }
            },
            required: ["latitude", "longitude"],
            additionalProperties: false
          },
          description: "List of the past locations of a person"
        },
        plants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "Code of the power plant"
              },
              latitude: {
                type: "number",
                description: "Latitude of the power plant"
              },
              longitude: {
                type: "number",
                description: "Longitude of the power plant"
              }
            },
            required: ["code", "latitude", "longitude"],
            additionalProperties: false
          },
          description: "List of the power plants with their codes and coordinates"
        }
      },
      required: ["locations", "plants"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "verify",
    description: "Verify if the answer is correct. Returns a flag or an error",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "First name of the found person"
        },
        surname: {
          type: "string",
          description: "Last name of the found person"
        },
        accessLevel: {
          type: "number",
          description: "Access level of the found person"
        },
        powerPlant: {
          type: "string",
          description: "Code of the power plant"
        }
      },
      required: ["name", "surname", "accessLevel", "powerPlant"],
      additionalProperties: false
    },
    strict: true
  }
];
