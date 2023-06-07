import {APIEmbed, TextChannel} from "discord.js";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";

export const messageReactionRemove: Event<"messageReactionRemove"> = {
	async execute(_client, reaction, _user) {
		const {message} = reaction;
		const {guild} = message;

		if (guild) {
			const guildSettings = await guildSettingsSchema.findOne({id: guild.id});

			const starboardChannels = guildSettings?.starboard?.channels;

			if (starboardChannels?.length) {
				for (const channel of starboardChannels) {
					const starredMessageID = channel.starredMessageIDs[message.id] as string | undefined;

					// Message sent in starboard channel.
					if (starredMessageID) {
						// The assertion is safe as we know that the channel exists (starboard data is deleted from the database when the starboard channel is deleted)
						// The bot also checks that the channel is a text channel when the user inputs the ID/link, therefore the channel has to be an instance of the TextChannel type.
						// channel.channelID has to be a string since the input requires that.
						const starboardChannel = (await guild.channels.fetch(channel.channelID as string)) as TextChannel;

						const starredMessage = await starboardChannel.messages.fetch(starredMessageID);

						const {title} = starredMessage.embeds[0].data;

						// Assertion necessary because the embed needs to be edited.
						// Updating the reaction count.
						(starredMessage.embeds[0].data as APIEmbed).title = title?.replace(/> \d+/, `> ${reaction.count}`);

						await starredMessage.edit({
							embeds: starredMessage.embeds
						});
					}
				}
			}
		}
	}
};
