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

const model = resolveModelForProvider("gpt-5.4");

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
  console.log(data);
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

async function solve(query) {
    logQuestion(query);
    const answer = await chat([{ role: "user", content: query }]);
    logAnswer(answer);
    return answer;
}


const mainFlag = await solve(
    `You are a drone operator in a computer game.
    Download the drone API documentation and produce a series of instructions, which will send the drone to destination PWR6132PL
    and attack a dam.

    Location of the dam can be determined by analysis of the image at ${HUB_URL}/data/${AIDEVS_KEY}/drone.png
    There is a grid on that image. Rows and columns are 1-indexed from the top-left.

    You can try more than once, pay attention to the answers from the API.
    If successful you should get a flag {FLG: ...}. Output the flag.`
);

const secret = await solve(
    `You are a drone operator in a computer game.
    Download the drone API documentation and produce a series of instructions, which will send the drone to destination PWR8406PL,
    set the LED color to fuchsia, take an image and return to the base.
    You can try more than once, pay attention to the answers from the API.

    Localize a baloon on that image.
    There will be a grid on that image. Rows and columns are 1-indexed from the top-left.

    After this fly the drone again to that location, set the LED color to fuchsia, and attack the baloon.
    After successful attack another image should be fetched which should contain a flag {FLG: ...}. Output the flag.`
);

console.log(mainFlag);
console.log(secret);