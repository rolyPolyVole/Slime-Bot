import {Schema, model} from "mongoose";

const guildSettingsSchema = new Schema({
	id: String,
	youtube: {
		settings: {
			channels: [
				{
					youtubeChannelID: String,
					youtubeChannelProfilePictureURL: String,
					latestVideoID: String,
					discordChannelID: String,
					pingRoleID: String
				}
			]
		},
		appearance: {
			icon: String,
			colour: String
		},
		enabled: Boolean
	},
	starboard: {
		settings: {
			channels: [
				{
					channelID: String,
					pingRoleID: String,
					emojiID: String,
					emojiCount: Number,
					starredMessageIDs: {
						type: Object,
						of: String
					}
				}
			]
		},
		appearance: {
			icon: String,
			colour: String
		},
		enabled: Boolean
	}
});

export default model("Guild Settings", guildSettingsSchema, "Guild Settings");
