import { HUB_URL, AIDEVS_KEY } from "../../../config.js";
import {writeFile} from "fs/promises";
import fs from 'fs';
import mime from 'mime-types';

const session = `SESSION-${Math.floor(Math.random()*1000000)}`;

let counter = 0;
let started = false;

export const handlers = {
    async listen() {
        if (!started) {
            const response = await fetch(`${HUB_URL}/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    apikey: AIDEVS_KEY,
                    task: "radiomonitoring",
                    answer: {
                        action: "start"
                    }
                })
            });
            if (!response.ok) {
                const message = `Start request failed with status ${response.status}`;
                throw new Error(message);
            }
            started = true;
        }

        const response = await fetch(`${HUB_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: AIDEVS_KEY,
                task: "radiomonitoring",
                answer: {
                    action: "listen"
                }
            })
        });
        if (!response.ok) {
            console.log(JSON.stringify({
                apikey: AIDEVS_KEY,
                task: "radiomonitoring",
                answer: {
                    action: "listen"
                }
            }));
            console.log(response);
            const message = `Listen request failed with status ${response.status}`;
            throw new Error(message);
        }
        const signal = await response.json();
        if (signal.code !== 100 || signal.attachment === undefined) {
            return signal;
        }

        let fullPath;
        do {
            fullPath = process.cwd() + "/05_01_task/workspace/input/" + counter + '.' + mime.extension(signal.meta);
        } while(fs.existsSync(fullPath));
        counter ++;

        const buffer = Buffer.from(signal.attachment, "base64");
        console.log(`Writing to ${fullPath}`);
        await writeFile(fullPath, buffer);

        return {
            ...signal,
            attachment: null,
            file: fullPath
        };
    },

    async sendAnswer(data) {
        const body = JSON.stringify({
            apikey: AIDEVS_KEY,
            task: "radiomonitoring",
            answer: {
                action: "transmit",
                ...data
            }
        });
        const response = await fetch(`${HUB_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body
        });
        if (!response.ok) {
            console.log(body);
            console.log(response);
            const message = `sendAnswer request failed with status ${response.status}`;
            throw new Error(message);
        }
        return await response.json();
    }
};
