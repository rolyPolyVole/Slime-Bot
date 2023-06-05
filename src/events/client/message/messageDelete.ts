import {invertObject} from "../../../utility.js";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";

export const messageDelete: Event<"messageDelete"> = {
	async execute(_client, message) {
		const {guildId} = message;

		if (guildId) {
			const guildSettings = await guildSettingsSchema.findOne({id: guildId});

			if (guildSettings?.starboard?.channels?.length) {
				guildSettings.starboard.channels.forEach((starboardChannel, index) => {
					// Normally - original message ID: starboard channel message ID.
					// After inverting - starboard channel message ID: original message ID.
					const invertedStarredMessageIDs = invertObject(starboardChannel.starredMessageIDs);

					// Get the ID of the original message based on the ID of the starboard channel message.
					const originalMessageID = invertedStarredMessageIDs[message.id];

					if (
						originalMessageID // A starred message is deleted.
					) {
						// Delete the normal value - key pair of the original message ID - the starboard channel message ID.
						// It has to be done this weird way because I couldn't get it to work properly any other way.
						delete starboardChannel.starredMessageIDs[originalMessageID];

						// TypeScript would not shut up about guildSettings.starboard possibly being null even though that is impossible, so there is an if check here.
						if (guildSettings.starboard) guildSettings.starboard.channels[index] = starboardChannel;
					}
				});

				await guildSettings.save();
			}
		}
	}
};
