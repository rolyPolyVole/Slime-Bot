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
	}
});

export default model("Guild Settings", guildSettingsSchema, "Guild Settings");
