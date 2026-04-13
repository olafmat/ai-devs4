import { HUB_URL, OKO_URL, AIDEVS_KEY, AGENT_BROWSER } from "../../config.js";
import { spawn } from 'child_process'

const session = `SESSION-${Math.floor(Math.random()*1000000)}`;

export const handlers = {
  async edit_help() {
    return await handlers.edit_execute({operation: JSON.stringify({
        answer: {
            action: "help"
        }
    })});
  },

  async edit_execute({operation}) {
    try {
        console.log("operation " + typeof operation);
        console.log(operation);
        const body = {
          ...JSON.parse(operation),
          apikey: AIDEVS_KEY,
          task: "okoeditor"
        };
        console.log('Body')
        console.log(JSON.stringify(body));
        const response = await fetch(`${HUB_URL}/verify`, {
          method: "POST",
          body: JSON.stringify(body)
        });

        const data = await response.json();
        const result = {
            status: response.status,
            data
        }
        console.log(JSON.stringify(result));
        return result;
    } catch (ex) {
        console.log('Błąd');
        return {error: ex.message}
    }
  },

  async agent_browser_help() {
    return await handlers.agent_browser({command: "--help"});
  },

  async agent_browser({command}) {
    if ((command.includes("open") || command.includes(".com")) && !command.includes(OKO_URL)) {
        return {error: `You can only open sites inside ${OKO_URL} with this browser`};
    }
    const child = spawn('04_01_task' + AGENT_BROWSER, `--session ${session} ${command}`.split(' '), { encoding: 'utf-8' });

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
  }
};
