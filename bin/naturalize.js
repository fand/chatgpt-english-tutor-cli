#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";
import readline from "node:readline";
import { Writable } from "node:stream";
import meow from "meow";

// https://stackoverflow.com/questions/24037545
let isStdoutMuted = false;
const writableStdout = new Writable({
  write(chunk, encoding, callback) {
    if (!isStdoutMuted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  },
});

const cli = meow(`
	Usage
	  $ naturalize [text] [options]

	Options
	  --lang, -l     Target language (default: English)
	  --help, -h     Show help
	  --version, -v  Show version

	Examples
	  $ naturalize "This sentence need fix"
	  $ naturalize "Hello world" --lang Japanese
	  $ echo "This sentence need fix" | naturalize
	  $ naturalize  # Interactive mode

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

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

(async function main() {
  const lang = cli.flags.lang || DEFAULT_LANGUAGE;
  const input = cli.input.join(" ");

  if (input) {
    await run(input, lang);
  } else {
    const isTTY = process.stdin.isTTY;
    const rl = readline.createInterface({
      input: process.stdin,
      output: writableStdout,
      terminal: isTTY,
    });

    if (isTTY) {
      rl.setPrompt("> ");
      rl.prompt();
    } else {
      isStdoutMuted = true;
    }

    let lines = [];

    async function runLines(line_) {
      const line = line_.trim();
      if (line === "") {
        rl.pause();
        const text = lines.join("\n");
        lines = [];
        await run(text, lang);
        rl.resume();
      } else {
        lines.push(line);
      }

      isTTY && rl.prompt();
    }

    rl.on("resume", () => {
      lines = [];
    });
    rl.on("line", runLines);

    if (!isTTY) {
      rl.on("close", () => {
        isStdoutMuted = false;
        runLines("");
      });
    }
  }
})();

async function run(text, lang = DEFAULT_LANGUAGE) {
  if (text.trim() === "") {
    return;
  }

  try {
    const messages = generateMessages(text, lang);
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

function generateMessages(text, lang = DEFAULT_LANGUAGE) {
  return [
    {
      role: "system",
      content: `Please edit the text below to make it sound more natural in ${lang}.

====
${text}
====
`,
    },
  ];
}
