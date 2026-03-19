import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async help() {
    return await handlers.operation({name: "help", arguments: "{}"})
  },

  async operation(operation) {
    const response = await fetch(`${HUB_URL}/api/zmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        action: operation.name,
        ...JSON.parse(operation.arguments)
      })
    });

    const result = await response.json();
    console.log(JSON.stringify(result));
    return result;
  },

  async solution(answer) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "mailbox",
        answer
      })
    });

    const params = await response.json();
    console.log(JSON.stringify(params));
    return params;
  }
};
