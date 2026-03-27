import { HUB_URL, AIDEVS_KEY } from "../../config.js";
import { setTimeout } from "timers/promises";

export const handlers = {
  async tool_search({query}) {
    return await handlers.use_tool({name: "toolsearch", query })
  },

  async use_tool({name, query}) {
    console.log(`use tool ${name} with query "${query}"`)
    const response = await fetch(`${HUB_URL}/api/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        query
      })
    });

    const data = await response.json();
    const result = {
        status: response.status,
        data
    }
    console.log(JSON.stringify(result));
    await setTimeout(5000);
    return result;
  },

  calculator({route, consumption_of_chosen_vehicle, consumption_of_walking}) {
    console.log('used calculator');
    let fuel = 0;
    let food = 0;
    let cost = consumption_of_chosen_vehicle;
    for (let move of route) {
        if (move === 'left' || move === 'right' || move === 'up' || move === 'down') {
            fuel += cost.fuel;
            food += cost.food;
        }
        if (move === 'dismount') {
            cost = consumption_of_walking;
        }
    }

    const enoughFuel = fuel <= 10.0;
    const enoughFood = food <= 10.0;
    const out = {
        consumed: {
            fuel,
            food
        },
        left: {
            fuel: 10.0 - fuel,
            food: 10.0 - food
        },
        comment: [
            [
                "This route would consume too much fuel and food.",
                "This route would consume too much fuel."
            ],
            [
                "This route would consume too much food.",
                "There is enough food and fuel for this route."
            ]
        ][enoughFuel ? 1 : 0][enoughFood ? 1 : 0]
    };
    console.log(route);
    console.log(out);
    return out;
  },

  async propose_route({route}) {
    console.log(`propose route ${JSON.stringify(route)}`)
    const response = await fetch(`${HUB_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: AIDEVS_KEY,
        task: "savethem",
        answer: route
      })
    });

    const data = await response.json();
    const result = {
        status: response.status,
        data,
        headers: response.headers
    }
    console.log(JSON.stringify(result));
    await setTimeout(5000);
    return result;
  },

  async wait({milliseconds}) {
    console.log(`Waiting ${milliseconds} ms`);
    await setTimeout(milliseconds);
    return {"waited": milliseconds}
  }
};
