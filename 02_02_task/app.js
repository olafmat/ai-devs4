import { readdir, readFile, writeFile, unlink, mkdir, stat } from "fs/promises";
import sharp from "sharp";
import {
  HUB_URL,
  AI_API_KEY,
  AIDEVS_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
} from "../config.js";
import {
  download_image,
  vision,
  save_base64_image_to_file
} from "../api.js";
import {
  buildNextConversation,
  getFinalText,
  getToolCalls,
  logAnswer,
  logQuestion,
} from "./helper.js";
import {
  tools,
  handlers
} from "./tools/index.js";

const model = resolveModelForProvider("gpt-5.3-codex");

const webSearch = true;

const requestResponse = async (input) => {
  const body = buildResponsesRequest({
    model,
    input,
    tools,
    webSearch,
  });

  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  return data;
};

const MAX_TOOL_STEPS = 100;

const chat = async (conversation) => {
  let currentConversation = conversation;
  let stepsRemaining = MAX_TOOL_STEPS;

  while (stepsRemaining > 0) {
    stepsRemaining -= 1;

    const response = await requestResponse(currentConversation);
    const toolCalls = getToolCalls(response);

    if (toolCalls.length === 0) {
      return getFinalText(response);
    }

    currentConversation = await buildNextConversation(currentConversation, toolCalls, handlers);
  }

  throw new Error(`Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`);
};

export async function download_image_shrink(url, times = 4) {
  const response = await fetch(url);
  const blob = await response.arrayBuffer();
  const originalBuffer = Buffer.from(blob);

  const metadata = await sharp(originalBuffer).metadata();

  const width = metadata.width ? Math.max(1, Math.floor(metadata.width / times)) : undefined;
  const height = metadata.height ? Math.max(1, Math.floor(metadata.height / times)) : undefined;

  const resizedBuffer = await sharp(originalBuffer)
      .resize(width, height)
      //.sharpen()
      .toBuffer();

  return resizedBuffer.toString("base64");
}

export async function stack_images_vertical(base64Top, base64Bottom) {
  const topBuffer = Buffer.from(base64Top, "base64");
  const bottomBuffer = Buffer.from(base64Bottom, "base64");

  const topImage = sharp(topBuffer);
  const bottomImage = sharp(bottomBuffer);

  const topMetadata = await topImage.metadata();
  const bottomMetadata = await bottomImage.metadata();

  const width = Math.max(topMetadata.width || 0, bottomMetadata.width || 0);

  const stacked = await sharp({
    create: {
      width,
      height: (topMetadata.height || 0) + (bottomMetadata.height || 0),
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: await topImage.toBuffer(), top: 0, left: (width - topMetadata.width) >> 1 },
      { input: await bottomImage.toBuffer(), top: topMetadata.height || 0, left: (width - bottomMetadata.width) >> 1 },
    ])
    .png()
    .toBuffer();

  return stacked.toString("base64");
}

let cache_target = null;

async function analyze(url_initial, url_target) {
    const query = `Which squares are different in the first and second board?
        Produce a list of texts rxc where r is a row number and c is a column number.
        Don't add anything else.
        Rows and columns are 1-indexed from the top-left.`

    const image_initial = await download_image(url_initial);
    const image_target = cache_target ? cache_target : await download_image(url_target);
    cache_target = image_target;
    const image_combined = await stack_images_vertical(image_initial, image_target);
    await save_base64_image_to_file(image_combined, "d:/springworkspace/ai-devs4/02_02_task/electricity.png");
    const answer = await vision({
      imageUrl: `data:image/png;base64,${image_combined}`,
      question: query,
      visionModel: model
    });

    logAnswer(answer);
    return answer;
}

async function solve() {
    let reset = true;
    let found = false;

    do {
        const res = await analyze(
          `${HUB_URL}/data/${AIDEVS_KEY}/electricity.png${reset ? '?reset=1' : ''}`,
          `${HUB_URL}/i/solved_electricity.png`
        );
        reset = false;

        const query = `
        For each of texts rxc where r and c are numbers call 'rotate' tool with r as a row number and c as a column number:
        ${res}
        If the flag {FLG: ...} is returned, output it.
        If there is no flag, output only 'No'`;

        logQuestion(query);

        const answer = await chat([{ role: "user", content: query }]);
        logAnswer(answer);
        found = answer.includes("FLG")
    } while (!found);
}

await solve();