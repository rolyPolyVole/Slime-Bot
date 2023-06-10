import {Event} from "types";
import guildSettingsSchema from "../../../schemas/guildSettingsSchema.js";
import mongoose from "mongoose";

export const guildCreate: Event<"guildCreate"> = {
	async execute(_client, guild) {
		const guildSettings = new guildSettingsSchema({
			_id: new mongoose.Types.ObjectId(),
			id: guild.id,
		});

		await guildSettings.save();
	},
};
