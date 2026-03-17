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
  async rotate({row, column}) {
    console.log(`Rotating ${row}x${column}`)
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "electricity",
        answer: {
            rotate: `${row}x${column}`
        }
      })
    });
    console.log(response.status);

    const params = await response.json();
    console.log(JSON.stringify(params));
    return {
        status: response.status,
        params
    }
  }
};
