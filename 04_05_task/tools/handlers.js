import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async execute({answer}) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "foodwarehouse",
        answer: JSON.parse(answer)
      })
    });

    const data = await response.json();
    const result = {
        status: response.status,
        ...data
    }
    console.log(JSON.stringify(result));
    return result;
  }
};
