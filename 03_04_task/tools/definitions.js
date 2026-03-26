export const tools = [
  {
    type: "function",
    name: "query_database",
    description: "Query database with SQL",
    parameters: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "SQL SELECT query"
        },
      },
      required: ["sql"],
      additionalProperties: false
    },
    strict: true
  }
];
