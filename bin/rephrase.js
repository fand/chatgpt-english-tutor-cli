#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";

const config = rc("chatgptenglish");
const OPENAI_API_KEY = config.OPENAI_API_KEY;
const DEFAULT_LANGUAGE = config.DEFAULT_LANGUAGE || "English";

if (!OPENAI_API_KEY) {
  console.error("Please save your API key in `~/.config/chatgptenglish` file.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

(async function main() {
  let lang = DEFAULT_LANGUAGE;
  let inputArgs = process.argv.slice(2);
  
  // Check for --lang option
  const langIndex = inputArgs.findIndex(arg => arg === "--lang" || arg === "-l");
  if (langIndex !== -1 && langIndex + 1 < inputArgs.length) {
    lang = inputArgs[langIndex + 1];
    inputArgs.splice(langIndex, 2); // Remove --lang and its value
  }

  const input = inputArgs[0];
  const count = inputArgs[1] ?? 5;

  await run(input, count, lang);
})();

async function run(text, count, lang = DEFAULT_LANGUAGE) {
  try {
    const messages = generateMessages(text, count, lang);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 2000,
    });
    const result = completion.choices[0].message.content;
    console.log(result);
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
  }
}

function generateMessages(text, count, lang = DEFAULT_LANGUAGE) {
  return [
    {
      role: "system",
      content: `Rephrase the text after "====" in ${count} different ways in ${lang} and explain the distinctions in max 10 words for each.

====
${text}
`,
    },
  ];
}
