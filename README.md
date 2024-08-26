# ChatGPT English Tutor CLI

![Example of the commands](example.png)

This repository contains multiple commands to assist with learning and writing English.


## Setup

First, install the commands using npm:
```
npm i -g @fand/chatgpt-english-tutor
```

Then save your OpenAI API key to `~/.config/chatgptenglish` like this:

```
OPENAI_API_KEY=XXXXXXXXXXXXXXXXXXXX
```

## Usage

### `naturalize`

This command transforms the given text into more natural-sounding English.

Usage:
```
$ naturalize THE SENTENCE YOU WANT TO NATURALIZE
```

Example:
```
$ naturalize "All your base are belong to us"
All your bases are now under our control.

$ naturalize this command makes the given text into more natural English.
This command transforms the given text into more natural-sounding English.


# It also supports STDIN inputs
$ echo 'Pipes also work!' | naturalize
Pipes work too!

$ naturalize
If no arguments are passed, naturalize will read the text input on the terminal.
The input will be concatenated until a blank line is inserted, then it shows the output.

If no arguments are passed, 'naturalize' will read the text input from the terminal. The input will continue to be concatenated until a blank line is inserted, at which point the output will be displayed.
```

### `rephrase`

This command provides multiple rephrasings of the given text.

Example:
```
$ rephrase

1. Become a citizen: Grant citizenship status.
2. Adapt to environment: Adjust to a new environment.
3. Normalize: Make typical or usual.
4. Accustom: Become accustomed to something.
5. Familiarize: Make familiar or acquainted.
```

## Author

AMAGI ([GitHub](https://github.com/fand), [Threads](https://www.threads.net/@amagitakayosi))


## LICENSE

MIT
