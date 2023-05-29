import dotenv from "dotenv";

dotenv.config();

import {Client} from "discord.js";

const {botToken} = process.env;

const client = new Client({intents: [], partials: []});

await client.login(botToken);
