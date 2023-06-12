import fs from "fs";
import path from "path";
import { load } from "js-yaml";

// wtf is this ES Module thing
import { fileURLToPath } from "url";
const languages_folder = path.join(
	fileURLToPath(import.meta.url),
	"../..",
	"lang"
);
const language_filenames = fs.readdirSync(languages_folder);
const languages = Object.fromEntries(
	language_filenames.map((name) => [
		name.split(".")[0],
		load(fs.readFileSync(path.join(languages_folder, name))),
	])
);

const DEFAULT_LANGUAGE = "es";

// TODO
const getLanguageCode = (message) => "es";
import { config } from "./main.js";

export default {
	get: (message, loc, ...args) => {
		const lang =
			languages[getLanguageCode(message)] || languages[DEFAULT_LANGUAGE];
		if (!lang) return console.error("Could not get language!");
		let msg = lang[loc] || loc;
		for (let i = 0; i < args.length; i++)
			msg = msg.split(`{${i}}`).join(args[i]);
		return msg;
	},
	format_cmd: (message, cmd) => config.prefix + config[cmd],
	s: (s, a = '"', b = a) => a + s + b,
};
