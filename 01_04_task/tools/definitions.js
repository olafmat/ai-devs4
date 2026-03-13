export const tools = [
  {
    type: "function",
    name: "list_files",
    description: "List files and directories at a given path within the sandbox",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path within sandbox. Use '.' for root directory."
        }
      },
      required: ["path"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "read_file",
    description: "Read the contents of a file",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file within sandbox"
        },
        binary: {
          type: "boolean",
          description: "If true, return file contents as base64-encoded string."
        }
      },
      required: ["path", "binary"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "write_file",
    description: "Write content to a file (creates or overwrites)",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file within sandbox"
        },
        content: {
          type: "string",
          description: "Content to write to the file"
        }
      },
      required: ["path", "content"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "file_info",
    description: "Get metadata about a file or directory",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file or directory"
        }
      },
      required: ["path"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "verify_declaration",
    description: "Verify a shipment declaration",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Relative path to the file that contains the declaration text"
        }
      },
      required: ["path"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "download_file",
    description: "Download file",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL of the file to download"
        },
        path: {
          type: "string",
          description: "Relative path to the resulting file"
        }
      },
      required: ["url", "path"],
      additionalProperties: false
    },
    strict: true
  }
];
