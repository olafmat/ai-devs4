import {
  AI_API_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
} from "../config.js";
import {
  buildNextConversation,
  getFinalText,
  getToolCalls,
  logAnswer,
  logQuestion,
} from "../helpers.js";
import {
  tools,
  handlers
} from "./tools/index.js";
import express from "express";
import {loadDatabase, queryDatabase} from './database.js';

await loadDatabase();
console.log(await queryDatabase(`SELECT name from cities where name='Wrocław'`));

const model = resolveModelForProvider("gpt-5-mini");


// `buildResponsesRequest()` maps this to OpenAI web search or OpenRouter online mode.
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

const MAX_TOOL_STEPS = 10;

var conversations = {};


const chat = async (sessionID) => {
  let currentConversation = conversations[sessionID];
  let stepsRemaining = MAX_TOOL_STEPS;

  while (stepsRemaining > 0) {
    stepsRemaining -= 1;

    const response = await requestResponse(currentConversation);
    const toolCalls = getToolCalls(response);

    if (toolCalls.length === 0) {
      return getFinalText(response);
    }

    currentConversation = await buildNextConversation(currentConversation, toolCalls, handlers);
    console.log(sessionID);
    //console.log(currentConversation);
    conversations[sessionID] = currentConversation;
  }

  throw new Error(`Tool calling did not finish within ${MAX_TOOL_STEPS} steps.`);
};

var app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    console.log(req.body);
    let conversation = conversations['session'];
    // console.log(conversation);
    if (!conversation) {
        conversation = [{ role: "system", content:
        `Jesteś asystentem odpowiadającym na pytania dotyczące dostępności przedmiotów w różnych miastach.
        Rozmawiasz z innym AI. Odpowiedź nie może przekraczać 500 bajtów i nie może być krótsza niż 4 bajty.
        Twój rozmówca będzie się pytał o miasta dla trzech przedmiotów.
        Masz do dyspozycji bazę danych SQL, z tabelami o następującej definicji:
        CREATE TABLE cities(
                   name TEXT,
                   cityCode TEXT PRIMARY KEY
                 ) STRICT;
        CREATE TABLE items(
                   name TEXT,
                   itemCode TEXT
                 ) STRICT;
        CREATE TABLE connections(
                   itemCode TEXT,
                   cityCode TEXT
                 ) STRICT;
        Wszystkie teksty w tabelach mają obcięte polskie znaki.
        `
        }];
        conversations['session'] = conversation;
    }
    conversation.push({ role: "user", content: req.body.params });
    logQuestion(req.body.params);
    //console.log(conversation);
    const answer = await chat('session');
    conversation.push({ role: 'assistant', content: answer });
    console.log(req.body.sessionID);
    //console.log(conversation);
    logAnswer(answer);
    res.send({output: answer});
});

await app.listen(3000, () => "Listening");
// ssh -p 443 -R0:localhost:3000 a.pinggy.io
