import {SlashCommandBuilder} from "discord.js";
import {Command} from "types";

export const settings: Command = {
	data: new SlashCommandBuilder().setName("settings").setDescription("📄 Access the server settings."),
	usage: ["settings category: <settings category>"],
	examples: ["settings category: 🎥 YouTube"],
	async execute(interaction, client) {}
};
