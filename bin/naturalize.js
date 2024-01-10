#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";

const OPENAI_API_KEY = rc("chatgptenglish").OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Please save your API key in `~/.config/chatgptenglish` file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

(async function main() {
  const input = process.argv.slice(2).join(" ");
  await run(input);
})();

async function run(text) {
  try {
    const messages = generateMessages(text);
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

function generateMessages(text) {
  return [
    {
      role: "system",
      content: `Please edit the text below to make it sound more natural.

====
${text}
====
`,
    },
  ];
}
