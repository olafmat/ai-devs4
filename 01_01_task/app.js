import {
  AI_API_KEY,
  EXTRA_API_HEADERS,
  RESPONSES_API_ENDPOINT,
  resolveModelForProvider
} from "../config.js";
import { extractResponseText } from "../helpers.js";

const MODEL = resolveModelForProvider("gpt-5.4");
const AIDEVS_KEY = process.env.AIDEVS_KEY?.trim() ?? "";

async function getPersonTable() {
  const response = await fetch(`${HUB_URL}/data/${AIDEVS_KEY}/people.csv`, {
    method: "GET",
    headers: {
      "Content-Type": "application/csv",
    }
  })
  if (!response.ok) {
      const message = `Request failed with status ${response.status}`;
      throw new Error(message);
  }
  return await response.text();
}

async function extractPerson(text) {
  const response = await fetch(RESPONSES_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${AI_API_KEY}`,
      ...EXTRA_API_HEADERS
    },
    body: JSON.stringify({
      model: MODEL,
      input: `Extract person information from CSV with fields name,surname,gender,birthDate,birthPlace,birthCountry,job: ${text}`,
      text: { format: personSchema }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const message = data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const outputText = extractResponseText(data);

  if (!outputText) {
    throw new Error("Missing text output in API response");
  }

  return JSON.parse(outputText);
}

const personSchema = {
  type: "json_schema",
  name: "person",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: {
        type: ["string", "null"],
        description: "First name of the person. Use null if not mentioned."
      },
      surname: {
        type: ["string", "null"],
        description: "Last name of the person. Use null if not mentioned."
      },
      gender: {
        type: ["string", "null"],
        description: "Gender of the person. Use M for male, F for female"
      },
      born: {
        type: ["number", "null"],
        description: "Year of birth. Use null if not mentioned or unclear."
      },
      city: {
        type: ["string", "null"],
        description: "City where the person lives."
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "List of skills. Possible values:  IT, TRANSPORT, EDUCATION, MEDICINE, PEOPLE, VEHICLES, MANUAL"
      }
    },
    required: ["name", "surname", "gender", "born", "city", "tags"],
    additionalProperties: false
  }
};

async function extractAndFilter(personCSV) {
    const table = personCSV.split("\n");
    const peoplePromises = table.filter(
        row => row.includes(',M,') && row.includes(",Grudziądz,")
    ).map(async function(row) {
        const person = await extractPerson(row);
        //console.log(row);
        //console.log(person);
        if (person.born < 2026-40 || person.born > 2026-20 || person.tags.filter(tag => tag === 'TRANSPORT').length === 0) {
            return null;
        }
        return person;
    })
    const people = (await Promise.all(peoplePromises))
        .filter(person => person !== null);
    return people;
}

async function main() {
  const personCSV = await getPersonTable();
  const people = await extractAndFilter(personCSV);
  /*for (const person of people) {
      console.log(person);
  }*/
  console.log(people);
  const answer = {
    apikey: process.env.AIDEVS_KEY,
    task: "people",
    answer: people
  }
  console.log(JSON.stringify(answer, true))
  /*const text = "John is 30 years old and works as a software engineer. He is skilled in JavaScript, Python, and React.";
  const person = await extractPerson(text);

  console.log("Name:", person.name ?? "unknown");
  console.log("Age:", person.age ?? "unknown");
  console.log("Occupation:", person.occupation ?? "unknown");
  console.log("Skills:", person.skills.length ? person.skills.join(", ") : "none");*/
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
