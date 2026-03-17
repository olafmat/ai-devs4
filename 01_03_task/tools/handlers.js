import {
  HUB_URL,
  AIDEVS_KEY
} from "../../config.js";
import { readFile } from "fs/promises";
import { resolve } from "path";

export const handlers = {
  async check_package(params) {
      const response = await fetch(`${HUB_URL}/api/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          action: "check",
          packageid: params.packageid
        })
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok || data.error) {
        const message = data?.error?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data
  },

  async redirect_package(params) {
      const response = await fetch(`${HUB_URL}/api/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: AIDEVS_KEY,
          action: "redirect",
          ...params
        })
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok || data.error) {
        const message = data?.error?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data
  }
};
