import {Routes} from "discord.js";
import {loopFolders} from "../../functions.js";
import {BotClient, Command} from "../../types.js";
import {REST} from "@discordjs/rest";

export default (client: BotClient) => {
	client.handleCommands = async () => {
		const {commandArray, commands} = client;

		await loopFolders("commands", async (command) => {
			const typedCommand = command as Command;

			commandArray.push(typedCommand.data);
			commands.set(typedCommand.data.name, typedCommand);
		});

		const rest = new REST({version: "9"}).setToken(process.env.discordBotToken as string);

		await rest.put(Routes.applicationCommands(process.env.discordApplicationID as string), {
			body: process.env.clearCommands ? [] : commandArray
		});
	};
};
