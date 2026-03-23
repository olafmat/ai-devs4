
import {
  HUB_URL,
  resolveModelForProvider,
} from "../config.js";
import {
  structuredOutput
} from "../helpers.js";
import { Readable } from "node:stream";
import unzipper from "unzipper";
import pLimit from 'p-limit';

const model = resolveModelForProvider("gpt-5-nano");

var files = {};

const classifySentiment = async (text) => {
  return await structuredOutput({
    prompt: `Is anything failing, suspicious, unusual, unexpected, unstable, concerning, untrustworthy or requiring maintenance or investigation reported in this text: "${text}"`,
    jsonFormat: sentimentSchema,
    outputModel: model,
  });
}

const sentimentSchema = {
  type: "json_schema",
  name: "suspicious",
  strict: true,
  schema: {
    type: "object",
    properties: {
      suspicious: {
        type: ["boolean"]
      }
    },
    required: ["suspicious"],
    additionalProperties: false
  }
};


const process = async (path, text) => {
  const json = JSON.parse(text);
  if (!json || !json.sensor_type || !json.operator_notes) {
    return false;
  }

  let cached = files[json.operator_notes];
  if (cached === undefined) {
    cached = {
      files: []
    };
    files[json.operator_notes] = cached;
    console.log(`Requested ${path}`);
    try {
      const resp = await classifySentiment(json.operator_notes);
      cached.llmAnswer = !!resp.suspicious
      if (cached.llmAnswer) {
        console.log(`Answered ${path}: ${json.operator_notes}\n${JSON.stringify(resp)}`)
      } else {
        console.log(`Answered ${path}`)
      }
    } catch (error) {
      console.log(text);
      console.log(error);
      cached.llmAnswer = false;
    }
  } else {
    console.log(`From cache ${path}`);
  }
  cached.files.push({
    path,
    json
  })
  //console.log(`State: ${JSON.stringify(cached)}`);
}

const evaluate = (file, llmAnswer) => {
  const json = file.json;
  const sensors = json.sensor_type.split(/\//);
  const isTemp = sensors.includes("temperature");
  const isPressure = sensors.includes("pressure");
  const isWater = sensors.includes("water");
  const isVoltage = sensors.includes("voltage");
  const isHumidity = sensors.includes("humidity")

  let failure = '';
  if (isTemp ? !(json.temperature_K >= 553 && json.temperature_K <= 873) : json.temperature_K !== 0) {
    failure = 'temp';
  }
  if (isPressure ? !(json.pressure_bar >= 60 && json.pressure_bar <= 160) : json.pressure_bar !== 0) {
    failure = 'pressure';
  }
  if (isWater ? !(json.water_level_meters >= 5.0 && json.water_level_meters <= 15.0) : json.water_level_meters !== 0) {
    failure = 'water';
  }
  if (isVoltage ? !(json.voltage_supply_v >= 229.0 && json.voltage_supply_v <= 231.0) : json.voltage_supply_v !== 0) {
    failure = 'voltage';
  }
  if (isHumidity ? !(json.humidity_percent >= 40.0 && json.humidity_percent <= 80.0) : json.humidity_percent !== 0) {
    failure = 'humidity';
  }

  if ((failure !== '') !== llmAnswer) {
    console.log("\n")
    console.log(json);
    console.log(failure);
    console.log(llmAnswer);
    console.log("not ok\n");
    return false;
  }

  return true;
}

const processSensorsZip = async () => {
  const response = await fetch(`${HUB_URL}/dane/sensors.zip`, { method: "GET" });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download sensors.zip (${response.status})`);
  }

  const zipStream = Readable.fromWeb(response.body);
  const threads = [];
  const limit = pLimit(50);

  for await (const entry of zipStream.pipe(unzipper.Parse({ forceStream: true }))) {
    const isJsonFile = entry.type === "File" && entry.path.toLowerCase().endsWith(".json");
    if (!isJsonFile) {
      entry.autodrain();
      continue;
    }

    const text = (await entry.buffer()).toString("utf-8");

    //if (["9604.json","8076.json","8410.json","8457.json","0307.json","4237.json","5000.json","0158.json","9614.json","9717.json","9848.json","0753.json","8369.json","0567.json","1269.json","2958.json"].includes(entry.path)) {
    //if (entry.path === '3713.json' || entry.path === '4342.json') {
      threads.push(limit(() => process(entry.path, text)));
    //}
  }

  await Promise.all(threads);

  let found = [];
  for (const [note, entry] of Object.entries(files)) {
    for (const file of entry.files) {
      const ok = evaluate(file, entry.llmAnswer);
      if (!ok) {
        //console.log(note);
        //console.log(JSON.stringify(file));
        found.push(file.path);
      }
    }
  }
  console.log(JSON.stringify(found));
}

const extractFlag = (text) => {
  const lines = text.split(/\r?\n/);

  let a = "";
  let b = "";

  // Line 3 (index 2)
  if (lines.length >= 3) {
    const fields = lines[2].split('"');
    if (fields.length > 1) {
      a = fields[1].substring(0, 4);
    }
  }

  // Line 9 (index 8)
  if (lines.length >= 9) {
    const fields = lines[8].split('"');
    if (fields.length > 3) {
      const s = fields[3];

      b =
        (s[43] || "") + // 44th char (0-based index)
        (s[59] || "") + // 60th
        (s[65] || "") + // 66th
        (s[73] || "") + // 74th
        (s[75] || "");  // 76th
    }
  }

  return `{FLG:${(a + b).toUpperCase()}}`;
}

const lookForSecret = async () => {
  const response = await fetch(`${HUB_URL}/dane/sensors.zip`, { method: "GET" });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download sensors.zip (${response.status})`);
  }

  const zipStream = Readable.fromWeb(response.body);
  const threads = [];

  for await (const entry of zipStream.pipe(unzipper.Parse({ forceStream: true }))) {
    const isJsonFile = entry.type === "File" && entry.path.toLowerCase().endsWith(".json");
    if (!isJsonFile) {
      entry.autodrain();
      continue;
    }

    const text = (await entry.buffer()).toString("utf-8");
    const flag = extractFlag(text);
    if (!flag.includes(' ') && !flag.includes(',')) {
      console.log(flag)
    }
  }
}

await processSensorsZip();
//await lookForSecret();
