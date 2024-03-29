import dotenv from "dotenv";

dotenv.config();

import {Client, Collection, GatewayIntentBits, Partials} from "discord.js";
import {loopFolders} from "./utility.js";
import {BotClient} from "types";
import {connect} from "mongoose";

const {discordBotToken, mongoDatabaseToken} = process.env;

const client = new Client({
	intents: Object.keys(GatewayIntentBits) as unknown as Partials[],
	partials: Object.keys(Partials) as unknown as Partials[]
}) as BotClient;

await loopFolders("functions", (callback) => (callback as Function)(client));

client.handleEvents().catch(console.error);

client.commandArray = [];
client.commands = new Collection();

client.handleCommands().catch(console.error);

client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

client.handleComponents().catch(console.error);

await client.login(discordBotToken);

client.onlineTimestamp = Date.now();

await connect(mongoDatabaseToken as string).catch(console.error);
