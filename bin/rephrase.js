#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";
import meow from "meow";

const cli = meow(`
	Usage
	  $ rephrase <text> [count] [options]

	Options
	  --lang, -l     Target language (default: English)
	  --help, -h     Show help
	  --version, -v  Show version

	Examples
	  $ rephrase "Hello world"
	  $ rephrase "Hello world" 3
	  $ rephrase "Hello world" --lang Japanese
	  $ rephrase "Hello world" 3 --lang Spanish

	Configuration
	  Save your OpenAI API key in ~/.config/chatgptenglish file:
	  echo 'OPENAI_API_KEY=your_api_key_here' > ~/.config/chatgptenglish
`, {
	importMeta: import.meta,
	flags: {
		lang: {
			type: 'string',
			shortFlag: 'l'
		}
	}
});

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
  const lang = cli.flags.lang || DEFAULT_LANGUAGE;
  const input = cli.input[0];
  const count = cli.input[1] ?? 5;

  if (!input) {
    cli.showHelp();
    return;
  }

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
