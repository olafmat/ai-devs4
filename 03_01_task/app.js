
import {
  HUB_URL,
  resolveModelForProvider,
} from "../config.js";
import {
  structuredOutput
} from "../helpers.js";
import { Readable } from "node:stream";
import unzipper from "unzipper";

const model = resolveModelForProvider("gpt-5-nano");

var files = {};

const classifySentiment = async (lines) => {
  //console.log(JSON.stringify(lines));
  return await structuredOutput({
    prompt: `Which lines suggest problems with the sensor?\n${JSON.stringify(lines)}`,
    jsonFormat: sentimentSchema,
    outputModel: model,
  });
}

const sentimentSchema = {
  type: "json_schema",
  name: "lines",
  strict: true,
  schema: {
    type: "object",
    properties: {
      problems: {
        type: "array",
        items: {
          type: ["number"]
        },
        description: "Array of line ids with problems"
      }
    },
    required: ["problems"],
    additionalProperties: false
  }
};


const process = (path, text) => {
  const json = JSON.parse(text);
  if (!json || !json.sensor_type || !json.operator_notes) {
    return false;
  }
  json.operator_notes = json.operator_notes.split(',')[0];

  let cached = files[json.operator_notes];
  if (cached === undefined) {
    cached = {
      files: []
    };
    files[json.operator_notes] = cached;
  }
  cached.files.push({
    path,
    json: {...json}
  })
  /*if (json.operator_notes !== cached.files[cached.files.length - 1].json.operator_notes) {
    console.log('ERROR_LAST ' + cached.files.length)
    console.log(json.operator_notes);
    console.log(cached.files[cached.files.length - 1].json.operator_notes);
  }*/
}

let totalOkData = 0;
let llmComplains = 0;

const evaluate = (file, llmAnswer) => {
  const json = file.json;
  const sensors = json.sensor_type.split(/\//);
  const isTemp = sensors.includes("temperature");
  const isPressure = sensors.includes("pressure");
  const isWater = sensors.includes("water");
  const isVoltage = sensors.includes("voltage");
  const isHumidity = sensors.includes("humidity")

  //let negative = false;
  let failure = '';
  if (
    typeof json.sensor_type !== 'string' ||
    typeof json.timestamp !== 'number' ||
    typeof json.temperature_K !== 'number' ||
    typeof json.pressure_bar !== 'number' ||
    typeof json.water_level_meters !== 'number' ||
    typeof json.voltage_supply_v !== 'number' ||
    typeof json.humidity_percent !== 'number' ||
    typeof json.operator_notes !== 'string'
  ) {
    failure = 'structure';
  }
  if (sensors.filter(sensor => sensor !== 'temperature' && sensor !=='pressure' && sensor !== 'water' && sensor !== 'voltage' && sensor !== 'humidity').length > 0) {
    failure = 'sensors';
  }

  if (isTemp ? !(json.temperature_K >= 553 && json.temperature_K <= 873) : (json.temperature_K !== 0)) {
    failure = 'temp';
    //negative = !isTemp;
  }
  if (isPressure ? !(json.pressure_bar >= 60 && json.pressure_bar <= 160) : (json.pressure_bar !== 0)) {
    failure = 'pressure';
    //negative = !isPressure;
  }
  if (isWater ? !(json.water_level_meters >= 5.0 && json.water_level_meters <= 15.0) : (json.water_level_meters !== 0)) {
    failure = 'water';
    //negative = !isWater;
  }
  if (isVoltage ? !(json.voltage_supply_v >= 229.0 && json.voltage_supply_v <= 231.0) : (json.voltage_supply_v !== 0)) {
    failure = 'voltage';
    //negative = !isVoltage;
  }
  if (isHumidity ? !(json.humidity_percent >= 40.0 && json.humidity_percent <= 80.0) : (json.humidity_percent !== 0)) {
    failure = 'humidity';
    //negative = !isHumidity;
  }

  if (failure !== '') {
    /*if (negative) {
      console.log("strange");
      console.log(failure);
      console.log(JSON.stringify(json));
    }*/
  } else {
    totalOkData++;
  }
  if (llmAnswer) {
    llmComplains++;
  }
  if ((failure !== '') || llmAnswer) {
    /*console.log("\n")
    console.log(json);
    console.log(failure);
    console.log(llmAnswer);
    console.log("not ok\n");*/
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

  for await (const entry of zipStream.pipe(unzipper.Parse({ forceStream: true }))) {
    const isJsonFile = entry.type === "File" && entry.path.toLowerCase().endsWith(".json");
    if (!isJsonFile) {
      await entry.autodrain();
      continue;
    }

    const text = (await entry.buffer()).toString("utf-8");

    //if (["9604.json","8076.json","8410.json","8457.json","0307.json","4237.json","5000.json","0158.json","9614.json","9717.json","9848.json","0753.json","8369.json","0567.json","1269.json","2958.json"].includes(entry.path)) {
    //if (entry.path === '3713.json' || entry.path === '4342.json') {
      process(entry.path, text);
    //}
  }

  //console.log(files);
  let question = {lines: []};
  let n = 0;
  for (const [note, entry] of Object.entries(files)) {
      question.lines.push({
        id: n,
        note        
      })
      n++;
  }

  const answer = await classifySentiment(question);
  let bad = answer.problems;

  let found = [];
  n = 0;
  let total = 0;
  for (const [note, entry] of Object.entries(files)) {
    const llmAnswer = bad.includes(n);
    //console.log(llmAnswer + "\t" + note);
    total += entry.files.length;
    for (const file of entry.files) {
      /*if (file.json.operator_notes != note) {
        console.log("ERROR");
        console.log(file);
        console.log(note);
      }
      if (llmAnswer) {
        console.log(n + "\t" + file.path);
      }*/
      const ok = evaluate(file, llmAnswer);
      if (!ok) {
        /*console.log(note);
        console.log(file.path);
        console.log(JSON.stringify(file));*/
        found.push(file.path);
      }
    }
    n++;
  }
  found.sort();
  console.log(JSON.stringify(found));
  /*console.log(totalOkData);
  console.log(llmComplains);*/
  //console.log(totalBad);
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
