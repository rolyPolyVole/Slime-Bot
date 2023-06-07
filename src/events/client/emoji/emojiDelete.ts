import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import {Event} from "types";

export const emojiDelete: Event<"emojiDelete"> = {
	async execute(_client, emoji) {
		const guildSettings = await guildSettingsSchema.findOne({id: emoji.guild.id});

		if (guildSettings?.starboard?.channels.length) {
			guildSettings.starboard?.channels.forEach((starboardChannel, index) => {
				if (starboardChannel.emojiID === emoji.id) {
					guildSettings.starboard?.channels.splice(index, 1);
				}
			});

			await guildSettings.save();
		}
	}
};
