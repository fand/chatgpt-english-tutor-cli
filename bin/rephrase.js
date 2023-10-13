#!/usr/bin/env node
import { Configuration, OpenAIApi } from "openai";
import rc from "rc";

const OPENAI_API_KEY = rc("chatgptenglish").OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Please save your API key in `~/.config/chatgptenglish` file.");
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

(async function main() {
  if (!configuration.apiKey) {
    process.exit(1);
  }
  const input = process.argv[2];
  const count = process.argv[3] ?? 5;

  await run(input, count);
})();

async function run(text, count) {
  try {
    const prompt = generatePrompt(text, count);
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      temperature: 0.6,
      max_tokens: 2000,
    });
    const result = completion.data.choices[0].text;
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

function generatePrompt(text, count) {
  return `Rephrase the text after "====" in ${count} different ways and explain the distinctions in max 10 words for each.

====
${text}
`;
}
