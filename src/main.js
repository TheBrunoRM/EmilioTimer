import Discord from "discord.js";
import { IntentsBitField } from "discord.js";
const client = new Discord.Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.DirectMessages,
	],
});

import ms from "pretty-ms";
import Locale from "./locale.js";
import fs from "fs";
import { load } from "js-yaml";
const config = load(fs.readFileSync("config.yml", "utf-8"));
client.login(config.token);

client.on("ready", () => console.log("Bot ready: " + client.user.username));

const hashmap = {};

client.on("messageCreate", (message) => {
	if (!message.content.startsWith(config.prefix)) return;
	const msg = message.content.substring(config.prefix.length).toLowerCase();
	switch (msg.split(/ +/g)[0]) {
		case config.start_cmd:
			if (hashmap[message.author.id])
				return message.reply(Locale.get(message, "ALREADY_STARTED"));
			hashmap[message.author.id] = {
				id: message.id,
				time: message.createdTimestamp,
			};
			message.reply(
				[
					Locale.get(message, "STARTED"),
					Locale.get(
						message,
						"STARTED_INFO",
						Locale.s(Locale.format_cmd(message, "finish_cmd"), "`")
					),
					Locale.s(Locale.get(message, "STARTED_WARNING"), "**"),
				].join("\n")
			);
			break;
		case config.finish_cmd:
			const t = hashmap[message.author.id]?.time;
			if (!t) return message.reply(Locale.get(message, "NOT_STARTED"));
			const time = message.createdTimestamp - t;
			message.reply(
				[
					Locale.get(message, "FINISHED"),
					Locale.get(message, "FINISHED_INFO", ms(time)),
				].join("\n")
			);
			client.channels.cache
				.get(config.announcement_channel_id)
				.send(
					Locale.get(
						message,
						"FINISHED_ANNOUNCEMENT",
						message.member,
						ms(time)
					)
				);
			delete hashmap[message.author.id];
			break;
	}
});

export { config };
