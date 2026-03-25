import { readdir, readFile, writeFile, unlink, mkdir, stat } from "fs/promises";
import {
  AI_API_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
} from "./config.js";

export const extractResponseText = (data) => {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const messages = Array.isArray(data?.output)
    ? data.output.filter((item) => item?.type === "message")
    : [];

  const textPart = messages
    .flatMap((message) => (Array.isArray(message?.content) ? message.content : []))
    .find((part) => part?.type === "output_text" && typeof part?.text === "string");

  return textPart?.text ?? "";
};

export const getToolCalls = (response) =>
  response.output.filter((item) => item.type === "function_call");

export const getFinalText = (response) =>
  response.output_text
  ?? response.output.find((item) => item.type === "message")?.content?.[0]?.text
  ?? "No response";

const supportsColor = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);

const ansi = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
};

const colorize = (text, ...styles) => {
  if (!supportsColor) {
    return text;
  }

  const sequence = styles.map((style) => ansi[style]).join("");
  return `${sequence}${text}${ansi.reset}`;
};

const label = (text, color) => colorize(`[${text}]`, "bold", color);
const formatJson = (value) => JSON.stringify(value, null, 2);

export const logQuestion = (text) => {
  console.log(`${label("USER", "blue")} ${text}\n`);
};

export const logToolCall = (name, args) => {
  console.log(`${label("TOOL", "magenta")} ${colorize(name, "bold")}`);
  console.log(colorize("Arguments:", "cyan"));
  console.log(colorize(formatJson(args), "dim"));
};

export const logToolResult = (result) => {
  console.log(colorize("Result:", "yellow"));
  console.log(colorize(formatJson(result), "dim"));
  console.log("");
};

export const logAnswer = (text) => {
  console.log(`${label("ASSISTANT", "green")} ${text}`);
};

export const executeToolCall = async (call, handlers) => {
  const args = call.arguments ? JSON.parse(call.arguments) : {};
  const handler = handlers[call.name];

  if (!handler) {
    throw new Error(`Unknown tool: ${call.name}`);
  }

  logToolCall(call.name, args);
  const result = await handler(args);
  logToolResult(result);

  return {
    type: "function_call_output",
    call_id: call.call_id,
    output: JSON.stringify(result),
  };
};

export const buildNextConversation = async (conversation, toolCalls, handlers) => {
  const toolResults = await Promise.all(
    toolCalls.map((call) => executeToolCall(call, handlers)),
  );

  return [...conversation, ...toolCalls, ...toolResults];
};

export async function download_image(url) {
  const response = await fetch(url);
  const blob = await response.arrayBuffer();
  const image = Buffer.from(blob).toString('base64');
  return image;
}

export async function save_base64_image_to_file(base64Image, filePath) {
  const buffer = Buffer.from(base64Image, "base64");
  await writeFile(filePath, buffer);
}

/**
* Calls a vision-capable model with an image.
*/
export const vision = async ({ imageUrl, question, visionModel }) => {
  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS
    },
    body: JSON.stringify({
      model: visionModel,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: question },
            { type: "input_image", image_url: imageUrl }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  console.log(data)

  if (!response.ok || data.error) {
    throw new Error(data?.error?.message || `Vision request failed (${response.status})`);
  }

  // recordUsage(data.usage);
  return extractResponseText(data) || "No response";
};

/**
 * Calls the LLM and forces it to respond with JSON matching the requested format.
 *
 * @param {object} params
 * @param {string} params.prompt
 * @param {object|string} params.jsonFormat - Either a JS object (example) or a JSON-schema-like string.
 * @param {string} params.outputModel
 * @returns {Promise<any>} Parsed JSON result.
 */
export const structuredOutput = async ({ prompt, jsonFormat, outputModel }) => {
  // If caller provides a ready-to-use schema (like in 01_01_task), use it directly.
  const isJsonSchemaFormat =
    jsonFormat
    && typeof jsonFormat === "object"
    && jsonFormat.type === "json_schema"
    && typeof jsonFormat.schema === "object";

  const inferType = (value) => {
    if (value === null) {
      // We often use null in examples to indicate "may be null".
      // Default to string-or-null as a practical fallback.
      return { type: ["string", "null"] };
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: "array", items: { type: "string" } };
      }
      return { type: "array", items: inferType(value[0]) };
    }

    const t = typeof value;
    if (t === "string") return { type: "string" };
    if (t === "number") return { type: "number" };
    if (t === "boolean") return { type: "boolean" };

    if (t === "object") {
      const props = {};
      const required = [];

      for (const [k, v] of Object.entries(value)) {
        props[k] = inferType(v);
        required.push(k);
      }

      return {
        type: "object",
        properties: props,
        required,
        additionalProperties: false,
      };
    }

    // Fallback for unexpected JSON types.
    return { type: ["string", "null"] };
  };

  const schemaFormat = (() => {
    if (isJsonSchemaFormat) return jsonFormat;

    // Treat non-schema input as an example object and infer a JSON schema from it.
    if (jsonFormat === undefined) {
      throw new Error("jsonFormat is required");
    }

    const inferred = inferType(jsonFormat);
    return {
      type: "json_schema",
      name: "structured_output",
      strict: true,
      schema: inferred,
    };
  })();

  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS
    },
    body: JSON.stringify({
      model: outputModel,
      input: prompt,
      // Structured Outputs: constrain model output to exactly this JSON schema.
      text: { format: schemaFormat },
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data?.error?.message || `structuredOutput request failed (${response.status})`);
  }

  // When a model refuses, Responses API can include `refusal` field.
  if (data?.refusal) {
    throw new Error(`Model refused: ${data.refusal}`);
  }

  const text = extractResponseText(data) || "";
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Model did not return valid JSON matching schema. Raw output:\n${data}`);
  }
};

export const extractText = (response) => {
  return extractResponseText(response) || null;
};

