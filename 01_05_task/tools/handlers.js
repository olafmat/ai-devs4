import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async help() {
    return await handlers.execute({name: "help", arguments: "{}"})
  },

  async execute(operation) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "railway",
        answer: {
            action: operation.name,
            ...JSON.parse(operation.arguments)
        }
      })
    });

    const data = await response.json();
    const result = {
        status: response.status,
        data,
        headers: {
            "date": response?.headers["date"],
            "x-ratelimit-limit": response?.headers["x-ratelimit-limit"],
            "x-ratelimit-remaining": response?.headers["x-ratelimit-remaining"],
            "x-ratelimit-reset": response?.headers["x-ratelimit-reset"],
            "x-ratelimit-policy": response?.headers["x-ratelimit-policy"],
        }
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
