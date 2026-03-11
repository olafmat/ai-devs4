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
    name: "get_distance",
    description: "Computes a distance between two points on Earth",
    parameters: {
      type: "object",
      properties: {
        longitude1: {
          type: "number",
          description: "Longitude of the first point"
        },
        latitude1: {
          type: "number",
          description: "Latitude of the first point"
        },
        longitude2: {
          type: "number",
          description: "Longitude of the second point"
        },
        latitude2: {
          type: "number",
          description: "Latitude of the second point"
        }
      },
      required: ["longitude1", "latitude1", "longitude2", "latitude2"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "verify",
    description: "Verify if the answer is correct",
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
