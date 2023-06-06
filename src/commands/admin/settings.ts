import {SlashCommandBuilder, SlashCommandStringOption} from "discord.js";
import {Command} from "../../types";
import guildSettingsSchema from "schemas/guildSettingsSchema";
import { GuildSettingsEmbedSystem, fetchSettingCategories } from "utility";

export const settings: Command = {
	data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Opens an interface to manage the server's settings")
            .addStringOption(
                new SlashCommandStringOption()
                    .setChoices(...fetchSettingCategories(guildSettingsSchema.schema.obj))
                    .setName("category")
                    .setDescription("The category of the settings to change.")
                    .setRequired(false)
            ),
	usage: ["category: settings category"],
	async execute(interaction, _client) {
        const settingsEmbedSystem = new GuildSettingsEmbedSystem(interaction);
        const category = interaction.options.getString("category");

        if (category) settingsEmbedSystem.navigateEmbedByCategory(category);

        return await interaction.reply({
            embeds: [settingsEmbedSystem.toEmbed()]
        });
	}
};