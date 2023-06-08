import {
	APIEmbed,
	AutocompleteInteraction,
	ImageURLOptions,
	Interaction,
	InteractionType,
	TextChannel
} from "discord.js";
import {readdirSync} from "fs";
import {BotClient} from "types";
import chalk from "chalk";

const {whiteBright, bold} = chalk;

/**
 * ! By default, exports are sorted by:
 * * 1. Functions -> Classes -> Enums -> Objects -> Regular Expressions -> Arrays.
 * * 2. The order they were created in, with oldest being first.
 * However, if two exports are related, E.g., the `isValidURL` function & the `URLRegExp` regular expression, they should be put together, with the export that has *higher priority* in the normal order being first, **unless** the *higher priority* export is in some way a more advanced form of the *lower priority* export, **or** if the *lower priority* export is used by the *higher priority* export.
 * They should be located in the section that the higher order export would normally be located in.
 * For example, the `isValidURL` function and the `URLRegExp` regular expression are related because they both involve URLs in strings, so they should be sorted together.
 * `isValidURL` is a function and has higher priority than `URLRegExp`. It would normally go first, but `isValidURL` is basically a more advanced form of `URLRegExp`, so it goes second.
 * Because `isValidURL` has a higher priority, both exports are located in the *functions* section.
 */

// ! Functions

/**
 * A function to loop over a folder containing categories, which themselves contain files. The files are passed as parameters to a callback function. Information about the files is logged to the console.
 * @param {string} path The path to the folder containing the categories. (from the src directory)
 * @param {(exports: unknown, filePath: string) => void | Promise<void>} callback The callback function to be called on each file.
 * @returns {Promise<void>}
 * @example
 * // ./src/bot.ts.
 * import {loopFolders} from "./functions.js";
 *
 * // ...
 *
 * // Loops through the client functions folder and calls the functions.
 * await loopFolders("functions", (callback) => (callback as Function)(client));
 *
 * // ...
 */
export const loopFolders = async (
	path: string,
	callback: (exports: unknown, filePath: string) => void | Promise<void>
): Promise<void> => {
	const categories = readdirSync(`./dist/${path}/`); // The path starts at src (dist) because most use cases of this function will start there anyway.

	for (const category of categories) {
		const categoryFiles = readdirSync(`./dist/${path}/${category}`).filter((file) => !file.endsWith(".js.map"));

		for (const file of categoryFiles) {
			const fileExports = await import(`../dist/${path}/${category}/${file}`);

			// If there is only one export, as is in the case of files such as command, button, modal and select menu exports, then only that export is passed into the function.
			// If it weren't for this check, then an object with only one property would be passed, making the code a bit more cluttered.
			// Implementing this is easier than using "export default" everywhere as that can get a bit cluttered when using type declarations.

			const exportKeys = Object.keys(fileExports);

			await callback(
				exportKeys.length === 1 ? fileExports[exportKeys[0]] : fileExports,
				`./dist/${path}/${category}/${file}`
			);
		}
	}
};

/**
 * A regular expression that matches all URLs in a string. (Global and ignore case flags)
 * @example
 * // Matching all URLs in a string.
 * import {URLRegExp} from "../../../utility.js";
 *
 * const string = "http://foo.co.uk/ Some example text in between https://marketplace.visualstudio.com/items?itemName=chrmarti.regex Some more random text - https://github.com/chrmarti/vscode-regex";
 *
 * const urls = URLRegExp.exec(string);
 * console.log(urls);
 * // => ["http://foo.co.uk/", "https://marketplace.visualstudio.com/items?itemName=chrmarti.regex", "https://github.com/chrmarti/vscode-regex"].
 * @example
 * // Matching all URLs in a string.
 * // ./src/events/client/message/messageReactionAdd.ts.
 * import {URLRegExp, isImageLink} from "../../../utility.js";
 *
 * // ...
 *
 * const {author, content, url, createdTimestamp, attachments, embeds} = message;
 *
 * // ...
 *
 * const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);
 *
 * // ...
 */
export const URLRegExp =
	/(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?/gi;

/**
 * A function to check if a string is a valid URL or not.
 * @param {string} urlString The string to check.
 * @returns {boolean} Whether the string is a valid URL.
 * @example
 *
 * isValidURL("styles.css");
 * // => false.
 *
 * isValidURL("https://www.youtube.com");
 * // => true.
 */
export const isValidURL = (urlString: string): boolean =>
	/^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i.test(
		urlString
	);

/**
 * A list of all (probably most) valid image file extensions.
 *
 * Used in the `isImageLink` function. `./src/utility.ts`
 * @example
 * // Checking if a link is an image link.
 * import {ImageExtensions} from "../../../utility.js";
 *
 * const string = "https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505";
 *
 * console.log(ImageExtensions.some((extension) => new RegExp(`.${extension}`, "i").test(string)));
 * // => true.
 * @example
 * // Used in the isImageLink function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * for (const extension of ImageExtensions)
 *	if (new RegExp(`\\.${extension}($|\\/[^/]+)`, "i").test(urlString)) return true;
 *
 * // ...
 */
export const ImageExtensions = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"tiff",
	"tif",
	"psd",
	"pdf",
	"eps",
	"ai",
	"indd",
	"cr2",
	"crw",
	"nef",
	"pef"
];

/**
 * A function to check whether a link leads to an image file based off of it's file extension.
 * @param {string} urlString The link to check whether it is an image or not.
 * @returns {boolean} Whether the link stores an image file or not.
 * @example
 * import {isImageLink} from "../../../utility.js";
 *
 * isImageLink("https://www.youtube.com");
 * // => false.
 *
 * isImageLink("https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505");
 * // => true.
 * @example
 * // Filtering out non-image links.
 * // ./src/events/client/message/messageReactionAdd.ts.
 * import {isImageLink} from "../../../utility.js";
 *
 * // ...
 *
 * const {author, content, url, createdTimestamp, attachments, embeds} = message;
 *
 * // ...
 *
 * // Shorthand syntax for:
 * // const messageImageURLs = (content?.match(URLRegExp) ?? []).filter((link) => isImageLink(link))
 * const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(isImageLink);
 *
 * // ...
 */
export const isImageLink = (urlString: string): boolean => {
	// For loop instead of forEach or reduce because jump target can not cross function boundary.
	// I.e. -> "return true" in the callback passed as an argument to the forEach function will return true in the scope of that callback, not that of the whole forEach function.
	// A regex pattern is used here instead of String.prototype.endsWith because there are certain cases where there can be more text after the file extension, as seen in the second example above.
	for (const extension of ImageExtensions)
		if (new RegExp(`\\.${extension}($|\\/[^/]+)`, "i").test(urlString)) return true;

	return false;
};

/**
 * A function that inverts an objects keys and values. Used in the `⭐ Starboard`.
 * @param {{[key: string]: string}} object The object to invert the values of.
 * @returns {{[key: string]: string}} A **new** object with the inverted keys and values.
 * @example
 * import {invertObject} from "../../../utility.js";
 *
 * let rolyPolyVole = { firstName: "roly", secondName: "Poly", thirdName: "Vole" };
 *
 * invertObject(rolyPolyVole);
 * // => { roly: "firstName", Poly: "secondName", Vole: "thirdName" }.
 * @example
 * // Inverting starboard message IDs object.
 * // ./src/events/client/message/messageDelete.ts.
 * import {invertObject} from "../../../utility.js";
 *
 * // ...
 *
 * // Normally - original message ID: starboard channel message ID.
 * // After inverting - starboard channel message ID: original message ID.
 * const invertedStarredMessageIDs = invertObject(starboardChannel.starredMessageIDs);
 *
 * // ...
 */
export const invertObject = (object: {[key: string]: string}): {[key: string]: string} => {
	const newObject: {[key: string]: string} = {};

	for (const key in object) {
		newObject[object[key]] = key;
	}

	return newObject;
};

/**
 * A function to log objects nicely to the console. Supports nested objects & indents accordingly.
 *
 * Logs the object keys as bold and white, and the object properties as white.
 * @param {{[key: string]: string}} object The object to log to the console.
 * @param {number} indent The level of indentation to start with. (Used for recursion)
 * @returns {void}
 * @example
 * // Logging a user object to the console.
 * import {logObject} from "../../../utility.js";
 *
 * const userData = {
 *	name: "rolyPolyVole",
 *	firstName: "roly",
 *	secondName: "Poly",
 *	thirdName: "Vole",
 *	stats: {
 *		coding: 10,
 *		troll: 42,
 *	intelligence: "99.999...",
 *		school: 10,
 *		discord: -50,
 *		opinion: -1000
 *		}
 * };
 *
 * logObject(userData);
 *
 * // Object logged nicely using chalk.
 * // Object keys are bold and white.
 * // Object values are white.
 * // =>
 * // name: rolyPolyVole
 * // firstName: roly
 * // secondName: Poly
 * // thirdName: Vole
 * // stats
 * //  coding: 10
 * //  troll: 42
 * //  intelligence: 99.999...
 * //  school: 10
 * //  discord: -50
 * //  opinion: -1000
 * @example
 * // Used in handleError.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * // Logs interaction details object to the console.
 * logObject({
 * 	// ...
 * })
 *
 * // ...
 */
export const logObject = (object: {[key: string]: unknown}, indent: number = 0): void => {
	for (const key in object) {
		if (typeof object[key] === "object" && object[key]) {
			console.log(`${" ".repeat(indent)}${bold(key)}`);
			logObject(object[key] as {[key: string]: unknown}, indent + 1);
		} else if (object[key]) console.log(`${" ".repeat(indent)}${bold(key)}:`, whiteBright(`${object[key]}`));
	}

	if (!indent) console.log();
};

/**
 * A function to attempt to handle errors as best as possible.
 *
 * Sends an embed with some of the error details and a prompt for the user to report the error. Used in `interactionCreate.ts`.
 * @param {Interaction} interaction The interaction that caused the error.
 * @param {BotClient} client The bot client
 * @param {unknown} error The error that occurred.
 * @returns {Promise<void>}
 * @example
 * // Handing errors in interactionCreate.
 * import {Command} from "types";
 * import {handleError} from "../../../utility.js";
 *
 * // ...
 *
 * try {
 *	 await (command as Command).execute(interaction, client);
 * } catch (error) {
 *	 handleError(interaction, client, error);
 * }
 *
 * // ...
 */
export const handleError = async (interaction: Interaction, client: BotClient, error: unknown): Promise<void> => {
	console.log();
	console.error(error);

	const {discordBotOwnerID, discordGuildID, discordSupportChannelID} = process.env;

	const discordBotOwner = discordBotOwnerID ? await client.users.fetch(discordBotOwnerID) : null;
	const discordGuild = discordGuildID ? await client.guilds.fetch(discordGuildID) : null;
	const discordGuildInvite = discordGuildID
		? [...((await discordGuild?.invites?.fetch())?.values() ?? [])].sort((a, b) =>
				!a.temporary
					? 1
					: // These are guaranteed to be numbers as we have already checked whether the invite has an infinite duration.
					(a.maxAge as number) > (b.maxAge as number)
					? 1
					: a.maxAge === b.maxAge
					? (a.maxUses ?? Infinity) - (b.maxUses ?? Infinity)
					: 0
		  )[0].code
		: null;

	const errorReply = {
		embeds: [
			{
				title: `<:_:${Emojis.Error}> Error!`,
				description: `\`${
					client.user?.username as string
				}\` has encountered an error while executing the interaction:\n\n\`\`\`css\n${error}\`\`\`\n> Interaction Custom ID / Name: \`${
					// This is needed or else TypeScript will complain.
					interaction.type === 2 || interaction.isAutocomplete() ? interaction.commandName : interaction.customId
				}\`\n\n${
					discordGuildID && discordBotOwnerID
						? `Please report this error to ${
								interaction.guildId === discordGuildID ? `<@${discordBotOwnerID}>` : `\`${discordBotOwner?.username}\``
						  } ${
								interaction.guildId === discordGuildID
									? `${discordSupportChannelID ? `in <#${discordSupportChannelID}>` : ""}`
									: `on [the support server](https://www.discord.gg/${discordGuildInvite})`
						  }!`
						: ""
				}`.trim(),
				color: 0xff0000,
				author: {
					name: client.user?.username as string,
					url: "https://github.com/Slqmy/Slime-Bot",
					icon_url: client.user?.displayAvatarURL(DisplayAvatarURLOptions)
				},
				footer: {
					text: interaction.user.username,
					icon_url: interaction.user.displayAvatarURL(DisplayAvatarURLOptions)
				},
				timestamp: new Date(Date.now()).toISOString()
			}
		]
	};

	if (process.env.debug) {
		console.log();
		logObject({
			"📜 Interaction Information": {
				"⏰ Time": {
					Date: new Date(interaction.createdTimestamp).toISOString(),
					TimeStamp: interaction.createdTimestamp
				},
				"🏠 Guild": {Name: interaction.guild?.name, ID: interaction.guildId},
				"📄 Channel": {
					Name: interaction.channel instanceof TextChannel ? interaction.channel.name : null,
					ID: interaction.channelId
				},
				"👤 User": {Tag: interaction.user.tag, ID: interaction.user.id},
				"💬 Message":
					interaction.type === InteractionType.ApplicationCommand ||
					interaction.type === InteractionType.ApplicationCommandAutocomplete
						? null
						: {
								"ID": interaction.message?.id,
								"Content": interaction.message?.content,
								"Embed Title": interaction.message?.embeds?.[0]?.data?.title,
								"Date": new Date(interaction?.message?.createdTimestamp ?? 0).toISOString(),
								"Timestamp": interaction?.message?.createdTimestamp
						  }
			}
		});
	}

	if (!(interaction instanceof AutocompleteInteraction)) {
		try {
			await interaction.reply(errorReply);
			// The variable is shadowed but it doesn't matter since 'error' isn't used beyond this point anyway.
		} catch (error) {
			await interaction.editReply(errorReply).catch(console.error);
		}
	} else {
		await interaction.channel?.send(errorReply).catch(console.error);
	}
};

/**
 * The standard, untouched console log function. Used in the refactored `console.log` function.
 * @example
 * // Used in the refactored console.log function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * standardLog(...data);
 *
 * // ...
 */
const standardLog = console.log.bind(console);

/**
 * List of all logged messages on the console. Used in the refactored `console.log` function.
 * @example
 * // Used in the refactored console.log function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * const previousLogs = consoleLogs[consoleLogs.length - 1];
 * const previousLog = previousLogs?.[previousLogs.length - 1];
 *
 * // ...
 */
const consoleLogs: unknown[][] = [];

/**
 * Refactored version of `console.log` that ensures that there are never more than two new lines between logged strings.
 * *(in reality, the function reduces the number of new lines between two logged strings by 1 (if needed), which, in most cases, results in two new lines remaining, which is the intended behavior)*
 * This creates a *very clean* and *professional* looking console with *consistent newlines*.
 * *Otherwise, there would be inconsistent new lines.*
 * E.g,
 *
 * [Database Status] Connecting...
 *
 * [Debug] [WS => Shard 0] Shard received all its guilds. Marking as fully ready.
 *
 * [Client] Ready! Online and logged in as 🌳 Slime Bot [/].
 *
 *
 * [Database Status] Connected.
 *
 * Between the client and database status messages, there are **three** new lines, which is *inconsistent* with the overall console style.
 * This refactoring of the function fixes that issue:
 *
 * [Database Status] Connecting...
 *
 * [Debug] [WS => Shard 0] Shard received all its guilds. Marking as fully ready.
 *
 * [Client] Ready! Online and logged in as 🌳 Slime Bot [/].
 *
 * [Database Status] Connected.
 */
console.log = (...data) => {
	const previousLogs = consoleLogs[consoleLogs.length - 1];
	const previousLog = previousLogs?.[previousLogs.length - 1];

	const latestLog = data[data.length - 1];

	if (
		typeof latestLog === "string" &&
		typeof previousLog === "string" &&
		// Remove possible control characters added by chalk.
		latestLog.replace(ANSIControlCharacterRegExp, "").startsWith("\n") &&
		previousLog.replace(ANSIControlCharacterRegExp, "").endsWith("\n")
	) {
		data[data.length - 1] = latestLog.replace(/\n/, "");
	}

	standardLog(...data);

	consoleLogs.push(data);
};

/**
 * A function to easily create a simple success message.
 * @param {string} message The message to display in the embed.
 * @returns {{embeds: [APIEmbed]}} A simple embed with the success message.
 */
export const createSuccessMessage = (message: string): {embeds: [APIEmbed]} => ({
	embeds: [
		{
			description: `${Emojis.Success} ${message}`,
			color: Colours.Transparent
		}
	]
});

/**
 * A function to easily create a simple error message.
 * @param {string} message The message to display in the embed.
 * @returns {{embeds: [APIEmbed]}} A simple embed with the error message.
 */
export const createErrorMessage = (message: string): {embeds: [APIEmbed]} => ({
	embeds: [
		{
			description: `${Emojis.Error} ${message}`,
			color: Colours.Transparent
		}
	]
});

// ! Classes

// ! Enums

/**
 * Some nice colours for embeds and what not.
 * @example
 * import {Colours} from "../../../utility.js";
 *
 * // Create an embed the colour (coloured side bar) of which exactly matches the colour of the embed itself, making it practically invisible.
 * // This results in a very clean and professional looking embed.
 * const embed = {
 * 	title: "Example Embed",
 * 	color: Colours.Transparent
 * };
 * @example
 * // Replying with a transparent coloured embed.
 * // ./src/commands/utility/ping.ts.
 * import {Colours} from "../../../utility.js";
 *
 * // ...
 *
 * await interaction.reply({
 * 	// ...
 * 	color: Colours.Transparent,
 * 	// ...
 * })
 *
 * // ...
 */
export enum Colours {
	/**
	 * A colour that exactly matches the colour of embed backgrounds using dark theme.
	 */
	Transparent = 0x2b2d31,
	/**
	 * A colour that matches the colour of embed backgrounds using light theme.
	 * Note: Not confirmed whether the colour actually matches, no way I'm going to enable Discord light theme to test.
	 */
	TransparentBright = 0xf2f3f5
}

/**
 * An enum of emoji IDs of emojis from `🌌 The Slimy Swamp 🌳` guild that the bot can use.
 * @example
 * // Using the YouTube logo emoji to create a nice message for the YouTube upload tracker.
 * // ./src/functions/tools/checkUploads.ts.
 * import {Emojis} from "../../../utility.js";
 *
 * // ...
 *
 * await discordChannel.send({
 *		// The emoji name does not need to be in between the two colons.
 *		// In fact, basically any string can go there.
 *		// To save space, just use underscores.
 *		content: `<:_:${Emojis.YouTubeLogo}:> ${pingRoleID ? `<@&${pingRoleID}> ` : ""}${title} has uploaded a new video!`,
 *		embeds: [
 *	// ...
 * ]
 * });
 *
 * // ...
 */
export enum Emojis {
	YouTubeLogo = "1115689277397926022", // https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png
	Success = "",
	Error = "1115712640954683534"
}

// ! Objects

/**
 * Some options for the `displayAvatarURL()` function that ensure the best quality avatar.
 * @example
 * // Sending the user's avatar in the footer icon of an embed when an error occurs.
 * // handleError function.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * const errorReply = {
 *  embeds: [{
 *  // ...
 *  footer: {icon_url: interaction.user.displayAvatarURL(DisplayAvatarURLOptions)},
 *  // ...
 * 	}]
 * }
 *
 * // ...
 *
 */
export const DisplayAvatarURLOptions: ImageURLOptions = {
	/**
	 * `forceStatic: false` - If the avatar is animated, don't force it to be static.
	 */
	forceStatic: false,
	/**
	 * `Size: 4096` - Make sure that the avatar is of the maximum size.
	 */
	size: 4096
};

// ! Regular Expressions

/**
 * A regular expression to match ANSI control characters.
 *
 * This is useful for cleaning up strings that were changed in some way by the `chalk` module.
 *
 * Used in the `console.log` function refactor.
 * @example
 * // Removing control characters added by chalk.
 * import {ANSIControlCharacterRegExp} from "../../../utility.js";
 * import chalk from "chalk";
 *
 * const {redBright, bold} = chalk;
 *
 * const message = redBright(bold("Hello, world!"));
 *
 * console.log(JSON.stringify(message));
 * // => "\u001b[91m\u001b[1mHello, world!\u001b[22m\u001b[39m"
 *
 * const trimmedMessage = message.replace(ANSIControlCharacterRegExp, "");
 *
 * console.log(JSON.stringify(trimmedMessage), trimmedMessage);
 * // => "Hello, world!" Hello, world!
 * @example
 * // Used in the console.log function refactor.
 * // ./src/utility.ts.
 *
 * // ...
 *
 * // Clearing out any invisible control characters, and then checking if the string starts with a new line.
 * latestLog.replace(ANSIControlCharacterRegExp, "").startsWith("\n")
 *
 * // ...
 *
 */
export const ANSIControlCharacterRegExp = /\x1B|\[\d{1,2}m/g;

// ! Arrays
