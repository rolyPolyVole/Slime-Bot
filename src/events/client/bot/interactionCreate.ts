import {InteractionType} from "discord.js";
import {AnyContextMenuCommand, AutoCompleteCommand, Command, Event} from "types";

// Very basic interactionCreate file, will be worked on later.
// TODO: Make the code better & more concise (don't repeat yourself).
// TODO: Make a general error handling system.
export const interactionCreate: Event<"interactionCreate"> = {
	async execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const {commands} = client;
			const command = commands.get(interaction.commandName);

			if (!command) {
				return interaction.reply("❌ Command not found.");
			}

			try {
				await (command as Command).execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
			const {buttons} = client;

			const button = buttons.get(interaction.customId);

			if (!button) {
				return interaction.reply("❌ Button not found.");
			}

			try {
				await button.execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isStringSelectMenu()) {
			const {selectMenus} = client;

			const selectMenu = selectMenus.get(interaction.customId);

			if (!selectMenu) {
				return interaction.reply("❌ Select menu not found.");
			}

			try {
				await selectMenu.execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.type === InteractionType.ModalSubmit) {
			const {modals} = client;

			const modal = modals.get(interaction.customId);

			if (!modal) {
				return interaction.reply("❌ Modal not found.");
			}

			try {
				await modal.execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isContextMenuCommand()) {
			const {commands} = client;

			const command = commands.get(interaction.commandName);

			if (!command) {
				return console.error(`❌ Command not found: ${interaction.commandName}`);
			}

			try {
				await (command as AnyContextMenuCommand).execute(interaction, client);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const {commands} = client;

			const command = commands.get(interaction.commandName);

			if (!command) {
				return console.error(`❌ Command not found: ${interaction.commandName}`);
			}

			try {
				await (command as AutoCompleteCommand).autocomplete(interaction, client);
			} catch (error) {
				console.error(error);
			}
		}
	}
};
