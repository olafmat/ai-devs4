import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async get_items() {
    const response = await fetch(`${HUB_URL}/data/${AIDEVS_KEY}/categorize.csv`, {
      method: "GET"
    });
    const text = await response.text();
    const items = text
        .substring(text.indexOf("\n") + 1)
        .split("\n")
        .map(line => ({
            code: line.substring(0,5),
            description: line.substring(7, line.length - 1)
        }))
        .filter(item => item.code);
    console.log(JSON.stringify(items));
    return items;
  },

  async reset() {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "categorize",
        answer: {
            prompt: "reset"
        }
      })
    });

    const params = await response.json();
    console.log(JSON.stringify(params));
    return params;
  },

  async categorize({prompt}) {
    console.log(`Prompt ${prompt}`);
    try {
        const response = await fetch(`${HUB_URL}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            apikey: AIDEVS_KEY,
            task: "categorize",
            answer: {
                prompt
            }
          })
        });

        const params = await response.json();
        console.log(JSON.stringify(params));
        return params;
    } catch(ex) {
        return "Error"
    }
  }
};
