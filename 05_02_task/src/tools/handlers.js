import { HUB_URL, AIDEVS_KEY } from "../../../config.js";
import {writeFile} from "fs/promises";
import fs from 'fs';
import {
    uploadAudioFile,
    transcribeAudio,
    analyzeAudio,
    processAudio,
    generateSpeech,
    generateMultiSpeakerSpeech,
    TTS_VOICES
} from "../native/audio/gemini.js";
import { Lame } from "node-lame";

let counter = 0;

async function convertPcmToMp3Buffer(pcmBuffer) {
    const encoder = new Lame({
        output: "buffer", // Kluczowe ustawienie: wynik trafi do bufora
        raw: true,        // Dane to surowy PCM (bez nagłówków WAV)
        sfreq: 24,        // Zmień na częstotliwość Twojego TTS (np. 24 lub 16 kHz)
        bitwidth: 16,     // Zazwyczaj 16-bit
        signed: true,
        mode: "m",
        bitrate: 256
    }).setBuffer(pcmBuffer);

    try {
        await encoder.encode();
        const mp3Buffer = encoder.getBuffer();
        return mp3Buffer;
    } catch (error) {
        console.error("Błąd konwersji:", error);
        throw error;
    }
}

export const handlers = {
    async call() {
        const response = await fetch(`${HUB_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: AIDEVS_KEY,
                task: "phonecall",
                answer: {
                    action: "start"
                }
            })
        });
        if (!response.ok) {
            console.log(respone);
            const message = `Call request failed with status ${response.status}`;
            throw new Error(message);
        }
        return await response.json();
    },

    async say({text}) {
        console.log(`We say: ${text}`);
        const said = await generateSpeech({text, voice: "Kore"})

        const pcmData = Buffer.from(said.audioData, 'base64');
        const mp3 = await convertPcmToMp3Buffer(pcmData)

        fs.mkdirSync('05_02_task/talk', {recursive: true});
        await writeFile(`05_02_task/talk/${counter++}_we.mp3`, mp3);

        const response = await fetch(`${HUB_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apikey: AIDEVS_KEY,
                task: "phonecall",
                answer: {
                    audio: mp3.toString('base64')
                }
            })
        });

        const responseText = await response.text();
        if (responseText.includes("{FLG:")) {
            console.log(`FLAG: ${responseText}`);
        }
        const answer = JSON.parse(responseText);

        if (!response.ok) {
            return {...answer, audio: null};
        }
        const audioBase64 = Buffer.from(answer.audio, 'base64');
        await writeFile(`05_02_task/talk/${counter++}_they.mp3`, audioBase64);
        const transcription = await transcribeAudio({audioBase64: answer.audio, mimeType: 'audio/mpeg', detectEmotions: true, targetLanguage: "Polish"})
        console.log(transcription);
        return transcription;
    }
};
