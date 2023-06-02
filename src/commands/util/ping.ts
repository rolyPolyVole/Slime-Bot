import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {Command} from "types";

export const ping: Command = {
	data: new SlashCommandBuilder().setName("ping").setDescription("🏓 Pong!"),
	usage: ["ping"],
	aliases: ["latency"],
	async execute(interaction, client) {
		const message =
			interaction instanceof ChatInputCommandInteraction
				? await interaction.deferReply({
						fetchReply: true
				  })
				: interaction;

		await (interaction instanceof ChatInputCommandInteraction ? interaction.editReply : interaction.reply)({
			embeds: [
				new EmbedBuilder()
					.setTitle("Pong! 🏓")
					.setColor("Red")
					.setDescription(
						`> 🤖 **API Latency**: \`${client.ws.ping}\`\n> \n> 👤 **Client Ping**: \`${
							message.createdTimestamp - interaction.createdTimestamp
						}\``
					)
			]
		});
	}
};
