import { HUB_URL, AIDEVS_KEY, AGENT_BROWSER } from "../../../config.js";
import vm from 'vm';
import { spawn } from 'child_process'
import { setTimeout } from "timers/promises";

const session = `SESSION-${Math.floor(Math.random()*1000000)}`;

export const handlers = {
    async agent_browser_help() {
        return await handlers.agent_browser({command: "--help"});
    },

    async agent_browser({command}) {
        if ((command.includes("open") || command.includes(".com")) && !command.includes(HUB_URL)) {
            return {error: `You can only open sites inside ${HUB_URL} with this browser`};
        }
        const child = spawn('05_05_task' + AGENT_BROWSER, `--session ${session} ${command}`.split(' '), { encoding: 'utf-8' });

        return await new Promise((resolve, reject) => {
            let stdout = '';
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', data => {
                const strData = data.toString();
                stdout += strData;
            });
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', data => {
                const strData = data.toString();
                stdout += strData;
            });
            child.on('close', code => {
                console.log(stdout);
                resolve({code, stdout});
            });
            child.on('exit', code => {
                console.log(stdout);
                resolve({code, stdout});
            });
        });
    },

    async execute({javaScriptCode, context}) {
        try {
            console.log(`Execute
                ${javaScriptCode}
                in context ${context}`)
            let sandbox = JSON.parse(context);
            vm.runInNewContext(javaScriptCode, sandbox);
            return {context: sandbox}
        } catch(ex) {
            return {error: ex.toString()};
        }
    },

    async apiHelp() {
        return await handlers.apiExecute({name: "help", arguments: "{}"})
    },

    async apiExecute(operation) {
        const response = await fetch(`${HUB_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: AIDEVS_KEY,
                task: "timetravel",
                answer: {
                    action: operation.name,
                    ...JSON.parse(operation.arguments)
                }
            })
        });

        const data = await response.json();
        const result = {
            status: response.status,
            data
        }
        console.log(JSON.stringify(result));
        return result;
    },

    async waitForMode({internalMode}){
        let mode;
        let res;
        do {
            res = handlers.apiExecute({name: 'getConfig'});
            console.log(res);
            console.log(res.data);
            console.log(res.data.config);
            mode = res.data.config.internalMode;
        } while (mode !== internalMode);
        return res;
    },

    async wait({milliseconds}) {
        console.log(`Waiting ${milliseconds} ms`);
        await setTimeout(milliseconds);
        return {"waited": milliseconds}
    }
};
