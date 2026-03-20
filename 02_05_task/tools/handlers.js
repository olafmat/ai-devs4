import { HUB_URL, AIDEVS_KEY } from "../../config.js";

async function download_image(url) {
    const response = await fetch(url);
    const blob = await response.arrayBuffer();
    const image = Buffer.from(blob).toString('base64');
    return {
        image,
        encoding: "base64",
        mime_type: "image/png"
    };
};

export const handlers = {
  async get_documentation() {
    const response = await fetch(`${HUB_URL}/dane/drone.html`, {
      method: "GET",
      headers: {
        "Content-Type": "text/html"
      }
    });

    return {
        html: await response.text()
    }
  },

  async fly({instructions}) {
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "drone",
        answer: {
            instructions
        }
      })
    });

    const result = await response.json();
    console.log(JSON.stringify(result));
    return result;
  },
};
