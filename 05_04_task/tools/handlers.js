import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";
import crypto from 'crypto';


async function send({command}) {
  await setTimeout(2000);
  let response;
  console.log(command);
  response = await fetch(`${HUB_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      apikey: AIDEVS_KEY,
      task: "goingthere",
      answer: {
        command
      }
    })
  });
  const data = await response.json();
  if (data.crashed) {
    console.log(JSON.stringify(data));
    return data;
  }

  await setTimeout(2000);

  const messageResponse = await fetch(`${HUB_URL}/api/getmessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      apikey: AIDEVS_KEY
    })
  });
  data.pilot = await messageResponse.json();

  await setTimeout(2000);
  let scannerResponse;
  while (true) {
    scannerResponse = await fetch(`${HUB_URL}/api/frequencyScanner?key=${AIDEVS_KEY}`, {
      method: "GET"
    });
    if (scannerResponse.ok) {
      break;
    }
    await setTimeout(5000);
  };

  data.scanResult = await scannerResponse.text();
  console.log(JSON.stringify(data));
  return data;
}


export const handlers = {
  async start() {
    return await send({command: "start"})
  },

  async straight() {
    return await send({command: "go"})
  },

  async up() {
    return await send({command: "left"})
  },

  async down() {
    return await send({command: "right"})
  },

  async neutralize({frequency, detectionCode}) {
    await setTimeout(5000);
    var shasum = crypto.createHash('sha1')
    shasum.update(detectionCode + "disarm")

    let response;
    while (true) {
      response = await fetch(`${HUB_URL}/api/frequencyScanner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          frequency,
          disarmHash: shasum.digest('hex')
        })
      });
      if (response.ok) {
        break;
      }
      await setTimeout(5000);
    }
    const data = await response.json();
    console.log(JSON.stringify(data));
    return data;
  }
};
