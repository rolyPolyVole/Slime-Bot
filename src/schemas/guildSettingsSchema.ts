import {Schema, model} from "mongoose";

const guildSettingsSchema = new Schema({
	id: String,
	prefix: String,
	youtube: {
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
	starboard: {
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
	}
});

export default model("Guild Settings", guildSettingsSchema, "Guild Settings");
