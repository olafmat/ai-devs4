import {
  AIDEVS_KEY
} from "../../config.js";
import { readFile } from "fs/promises";
import { resolve } from "path";

export const handlers = {
  async get_people() {
      return await readFile(resolve(import.meta.dirname, "..", "..", "01_01_task", "answer.json"), "UTF-8")
  },

  async get_power_plants() {
      const response = await fetch(`${HUB_URL}/data/${AIDEVS_KEY}/findhim_locations.json`, {
        method: "GET",
        headers: {
          "Content-Type": "application/csv",
        }
      })
      if (!response.ok) {
          const message = `Request failed with status ${response.status}`;
          throw new Error(message);
      }
      return await response.json();
  },

  async get_person_locations(person) {
      const response = await fetch("${HUB_URL}/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          ...person
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const message = data?.error?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data
  },

  async get_access_level(person) {
      const response = await fetch("${HUB_URL}/api/accesslevel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          ...person
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const message = data?.error?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data;
  },

  async get_nearest_power_plant(data) {
      const getDistance = data => {
          const hav = theta => (1 - Math.cos(theta)) / 2;
          const longDiff = (data.longitude1 - data.longitude2) / 180.0 * Math.PI;
          const latDiff = (data.latitude1 - data.latitude2) / 180.0 * Math.PI;
          const havTheta = hav(latDiff) + Math.cos(data.latitude1) * Math.cos(data.latitude2) * hav(longDiff);
          const theta = Math.acos(1 - 2 * havTheta);
          return theta * 6371.2;
      };

      const locations = data.locations;
      const plants = data.plants;
      let nearestLocation = null;
      let nearestPlant = null;
      let bestDistance = 1e20;
      for (let location of locations) {
          for (let plant of plants) {
              const distance = getDistance({
                longitude1: location.longitude,
                latitude1: location.latitude,
                longitude2: plant.longitude,
                latitude2: plant.latitude
              })
              if (distance < bestDistance) {
                bestDistance = distance;
                nearestLocation = location;
                nearestPlant = plant;
              }
          }
      }
      console.log(nearestLocation);
      console.log(nearestPlant);
      console.log(bestDistance);
      return {
        code: nearestPlant.code,
        distance: bestDistance
      };
  },

  async verify(answer) {
      const response = await fetch("${HUB_URL}/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          task: "findhim",
          answer
        })
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok || data.error) {
        return {
          verification: "failed"
        };
      }

      return {
        verification: "succeeded",
        ...data
      }
  }
};
