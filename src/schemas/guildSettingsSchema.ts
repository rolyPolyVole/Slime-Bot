import {Schema, model} from "mongoose";

const guildSettingsSchema = new Schema({
	id: String,
	prefix: String
});

export default model("Guild Settings", guildSettingsSchema, "Guild Settings");
