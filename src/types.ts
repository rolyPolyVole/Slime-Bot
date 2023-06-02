import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	Collection,
	ContextMenuCommandBuilder,
	Message,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	StringSelectMenuInteraction,
	UserContextMenuCommandInteraction
} from "discord.js";

/**
 * A type for the bot client. Extends the default Discord JS client class with the necessary methods used by the code.
 */
export type BotClient = Client & {
	commands: Collection<string, AnyCommand>;
	commandArray: (SlashCommandBuilder | ContextMenuCommandBuilder)[];
	buttons: Collection<string, Button>;
	selectMenus: Collection<string, SelectMenu>;
	modals: Collection<string, Modal>;
	handleEvents(): Promise<void>;
	handleCommands(): Promise<void>;
	handleComponents(): Promise<void>;
	checkUploads(): Promise<void>;
};

/**
 * A type for  handling Discord commands.
 */
export type Command = {
	data: SlashCommandBuilder;
	description?: string;
	usage: string[];
	examples?: string[];
	aliases?: string[];
	execute(interaction: ChatInputCommandInteraction | Message, client: BotClient, ...args: string[]): Promise<unknown>;
};

/**
 * Type for autocomplete commands. This basically extends base command type & adds an autocompletion function.
 * Note that examples are required for this command type.
 */
export type AutoCompleteCommand = {
	data: SlashCommandBuilder;
	description?: string;
	usage: string[];
	examples: string[];
	aliases?: string[];
	autocomplete(interaction: AutocompleteInteraction, client: BotClient): Promise<unknown>;
	execute(interaction: ChatInputCommandInteraction | Message, client: BotClient, ...args: string[]): Promise<unknown>;
};

export type MessageContextMenuCommand = {
	data: ContextMenuCommandBuilder;
	description: string;
	usage: string[];
	execute(interaction: MessageContextMenuCommandInteraction, client: BotClient): Promise<unknown>;
};

export type UserContextMenuCommand = {
	data: ContextMenuCommandBuilder;
	description: string;
	usage: string[];
	execute(interaction: UserContextMenuCommandInteraction, client: BotClient): Promise<unknown>;
};

export type AnyContextMenuCommand = MessageContextMenuCommand | UserContextMenuCommand;

export type AnyCommand = Command | AutoCompleteCommand | AnyContextMenuCommand;

export type Button = {
	name: string;
	execute(interaction: ButtonInteraction, client: BotClient): Promise<void>;
};

export type Modal = {
	name: string;
	execute(interaction: ModalSubmitInteraction, client: BotClient): Promise<void>;
};

export type SelectMenu = {
	name: string;
	execute(interaction: StringSelectMenuInteraction, client: BotClient): Promise<void>;
};

export type Event<K extends keyof ClientEvents> = {
	once?: boolean;
	execute(client: BotClient, ...args: ClientEvents[K]): Promise<unknown>;
};

export type ProcessEvent = {
	once?: boolean;
	execute(...args: unknown[]): void;
};

export type MongoEvent = {
	once?: boolean;
	execute(...args: unknown[]): void;
};
