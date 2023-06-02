import {InteractionType} from "discord.js";
import {Command, Event} from "types";

export const interactionCreate: Event<"interactionCreate"> = {
	async execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const {commands} = client;
			const {commandName} = interaction;
			const command = commands.get(commandName);

			if (!command) {
				return interaction.reply("No Code");
			}

			try {
				await (command as Command).execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
		} else if (interaction.isStringSelectMenu()) {
		} else if (interaction.type === InteractionType.ModalSubmit) {
		} else if (interaction.isContextMenuCommand()) {
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
		}
	}
};
