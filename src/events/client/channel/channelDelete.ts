import {DMChannel, GuildChannel} from "discord.js";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";

export const channelDelete: Event<"channelUpdate"> = {
	async execute(_client, channel: DMChannel | GuildChannel) {
		if (channel instanceof GuildChannel) {
			const {guild} = channel;

			const guildSettings = await guildSettingsSchema.findOne({id: guild.id});

			// Starboard channel deletion check.
			if (guildSettings?.starboard?.channels.length) {
				guildSettings.starboard.channels.forEach((starboardChannel, index) => {
					if (starboardChannel.channelID === channel.id) {
						guildSettings.starboard?.channels.splice(index, 1);
					}
				});

				await guildSettings.save();
			}

			// YouTube notification poster Discord channel deletion check.
			if (guildSettings?.youtube?.channels?.length) {
				guildSettings.youtube.channels.forEach((channelSettings, index) => {
					if (channelSettings.discordChannelID === channel.id) {
						guildSettings.youtube?.channels.splice(index, 1);
					}
				});
			}
		}
	}
};
