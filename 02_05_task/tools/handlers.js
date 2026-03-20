import {
  HUB_URL,
  AI_API_KEY,
  AIDEVS_KEY,
  buildResponsesRequest,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider,
} from "../../config.js";
import {
  logAnswer,
  logQuestion,
} from "../helper.js";
import {
  vision
} from "../../api.js";

const model = resolveModelForProvider("gpt-5.4");

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

  async analyze_image({image_url, prompt}) {
      const answer = await vision({
        imageUrl: image_url,
        question: prompt,
        visionModel: model
      });

      logAnswer(answer);
      return { answer };
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
