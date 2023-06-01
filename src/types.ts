import {Client} from "discord.js";

/**
 * A type for the bot client. Extends the default Discord JS client class with the necessary methods used by the code.
 */
export type BotClient = Client & {
	handleEvents?: () => Promise<void>;
	handleCommands?: () => Promise<void>;
	handleComponents?: () => Promise<void>;
};
