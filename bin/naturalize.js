#!/usr/bin/env node
import { OpenAI } from "openai";
import rc from "rc";
import readline from "node:readline";
import { Writable } from "node:stream";

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

const OPENAI_API_KEY = rc("chatgptenglish").OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Please save your API key in `~/.config/chatgptenglish` file.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

(async function main() {
  if (process.argv.length > 2) {
    const input = process.argv.slice(2).join(" ");
    await run(input);
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
        await run(text);
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

async function run(text) {
  if (text.trim() === "") {
    return;
  }

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
