import {SlashCommandBuilder} from "discord.js";
import {Command} from "../../types.js";
import {Colours} from "../../utility.js";

export const ping: Command = {
	data: new SlashCommandBuilder().setName("ping").setDescription("🏓 Pong!"),
	usage: ["ping"],
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true
		});

		await interaction.editReply({
			embeds: [
				{
					title: "Pong! 🏓",
					color: Colours.Transparent,
					description: `🤖 **API Latency**: \`${client.ws.ping}\`\n\n👤 **Client Ping**: \`${
						message.createdTimestamp - interaction.createdTimestamp
					}\``
				}
			]
		});
	}
};
