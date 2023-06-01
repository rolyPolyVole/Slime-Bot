import dotenv from "dotenv";

dotenv.config();

import {Client, GatewayIntentBits, Partials} from "discord.js";
import {loopFolders} from "./functions.js";
import {BotClient} from "./types.js";

const {discordBotToken} = process.env;

const client: BotClient = new Client({
	intents: Object.keys(GatewayIntentBits) as unknown as Partials[],
	partials: Object.keys(Partials) as unknown as Partials[]
});

await loopFolders("functions", async (callback) => {
	console.log(callback);

	(callback as Function)(client);
});

await client.login(discordBotToken);
