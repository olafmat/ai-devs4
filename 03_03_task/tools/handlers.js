import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async start() {
    return await handlers.execute({command: "start"})
  },

  async reset() {
    return await handlers.execute({command: "reset"})
  },

  async left() {
    return await handlers.execute({command: "left"})
  },

  async right() {
    return await handlers.execute({command: "right"})
  },

  async wait() {
    return await handlers.execute({command: "wait"})
  },

  async execute({command}) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "reactor",
        answer: {
            command
        }
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data));
    return data;
  }
};
