#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";

const OPENAI_API_KEY = rc("chatgptenglish").OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Please save your API key in `~/.config/chatgptenglish` file.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

(async function main() {
  const input = process.argv[2];
  const count = process.argv[3] ?? 5;

  await run(input, count);
})();

async function run(text, count) {
  try {
    const messages = generateMessages(text, count);
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

function generateMessages(text, count) {
  return [
    {
      role: "system",
      content: `Rephrase the text after "====" in ${count} different ways and explain the distinctions in max 10 words for each.

====
${text}
`,
    },
  ];
}
