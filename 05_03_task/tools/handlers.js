import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async execute({command}) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "shellaccess",
        answer: {
          cmd: command
        }
      })
    });

    const data = await response.json();
    const result = {
        status: response.status,
        ...data
    }
    console.log(JSON.stringify(result));
    return result;
  },

  async wait({milliseconds}) {
    console.log(`Waiting ${milliseconds} ms`);
    await setTimeout(milliseconds);
    return {"waited": milliseconds}
  }
};
