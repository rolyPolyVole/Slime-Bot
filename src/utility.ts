import {readdirSync} from "fs";
import { APIApplicationCommandOptionChoice } from "discord.js";
import {
	EmbedBuilder,
	APIEmbed,
	BaseInteraction,
	ModalSubmitInteraction,
	ButtonInteraction,
	blockQuote,
	inlineCode,
} from "discord.js";

import guildSettingsSchema from "./schemas/guildSettingsSchema";

/**
 * A function to loop over a folder containing categories, which themselves contain files. The files are passed as parameters to a callback function. Information about the files is logged to the console.
 * @param {string} path The path to the folder containing the categories. (from the src directory)
 * @param {(exports: unknown, filePath: string) => void | Promise<void>} callback The callback function to be called on each file.
 * @returns {Promise<void>}
 * @example
 * // ./src/bot.ts:17:0
 * import {loopFolders} from "./functions.js";
 *
 * ...
 *
 * // Loops through the client functions folder and calls the functions.
 * await loopFolders("functions", (callback) => (callback as Function)(client));
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
 * A regular expression that matches all URLs in a string. (Global and ignore case flags)
 * @example
 * import {URLRegExp} from "../../../utility.js";
 *
 * const string = "http://foo.co.uk/ Some example text in between https://marketplace.visualstudio.com/items?itemName=chrmarti.regex Some more random text - https://github.com/chrmarti/vscode-regex";
 *
 * const urls = URLRegExp.exec(string);
 * console.log(urls);
 * // => ["http://foo.co.uk/", "https://marketplace.visualstudio.com/items?itemName=chrmarti.regex", "https://github.com/chrmarti/vscode-regex"];
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
 * // => false;
 *
 * isValidURL("https://www.youtube.com");
 * // => true;
 */
export const isValidURL = (urlString: string): boolean =>
	/^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i.test(
		urlString
	);

/**
 * A list of all (probably most) valid image file extensions.
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
 * // => false;
 *
 * isImageLink("https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/dd/Slime_JE3_BE2.png/revision/latest?cb=20191230025505");
 * // => true;
 */
export const isImageLink = (urlString: string): boolean => {
	// For loop instead of forEach or reduce because jump target can not cross function boundary.
	// I.e. -> "return true" in the callback passed as an argument to the forEach function will return true in the scope of that callback, not that of the whole forEach function.
	// A regex pattern is used here instead of String.prototype.endsWith because there are certain cases where there can be more text after the file extension, as seen in the second example above.
	for (const extension of ImageExtensions) if (new RegExp(`\\.${extension}($|\\/[^/]+)`).test(urlString)) return true;

	return false;
};

/**
 * A function that inverts an objects keys and values.
 * @param {{[key: string]: string}} object The object to invert the values of.
 * @returns {{[key: string]: string}} A **new** object with the inverted keys and values.
 * @example
 * import {invertObject} from "../../../utility.js";
 *
 * let rolyPolyVole = { firstName: "roly", secondName: "Poly", thirdName: "Vole" };
 *
 * invertObject(rolyPolyVole);
 * // => { roly: "firstName", Poly: "secondName", Vole: "thirdName" };
 */
export const invertObject = (object: {[key: string]: string}) => {
	const newObject: {[key: string]: string} = {};

	for (const key in object) {
		newObject[object[key]] = key;
	}

	return newObject;
};

/**
 * Capitalises the first letter of a given string.
 * @param str The string to modify
 * @returns {string}
 */
export const capitaliseFirst = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const fetchSettingCategories = (schema: { [key: string]: any}): APIApplicationCommandOptionChoice<string>[] => {
	return Object.keys(schema)
		.filter((key: string) => schema[key as keyof typeof schema].hasOwnProperty("settings"))
		.map((category: string) => ({ name: category as string, value: category as string }));
}

export enum SettingsCategories {
	Home = "home",
	Youtube = "youtube",
}

/**
 * Manager of all Embeds and Component Interactions of the Guild Settings Embed System.
 */
export class GuildSettingsEmbedSystem extends EmbedBuilder {
	public data: APIEmbed;
	public currentCategory: SettingsCategories|string;
	public interaction: BaseInteraction;
	readonly homepage: APIEmbed;

	constructor (interaction: BaseInteraction) {
		super();
		this.interaction = interaction;
		this.currentCategory = SettingsCategories.Home;
		this.homepage = new EmbedBuilder()
		.setAuthor({ name: `${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? undefined })
		.setColor("Greyple")
		.setDescription(blockQuote("Welcome to the settings homepage of the bot. Here you can personalise and tweak the functions of the bot to suit your Discord server. Use the select menu below to visit the categories. Each category has settings which you can change to your liking."))
		.setFields({ name: "How to change Settings", value: "**1.** Choose a Category that has settings you want to change\n**2.** Click \"Edit\"\n**3.** Click a setting you want to change." })
		.setFooter({ text: "Server Settings & Preferences", iconURL: "https://creazilla-store.fra1.digitaloceanspaces.com/emojis/53795/gear-emoji-clipart-sm.png" })
		.setThumbnail("https://creazilla-store.fra1.digitaloceanspaces.com/emojis/53795/gear-emoji-clipart-sm.png")
		.setTimestamp(Date.now())
		.setTitle("Server Settings")
		.toJSON();
		this.data = this.homepage;
	}

	/**
	 * Returns an Embed shaped from the current page of the guild setting system.
	 * @returns {EmbedBuilder}
	 */
	public toEmbed (): EmbedBuilder {
		return EmbedBuilder.from(this.data);
	}
	
	/**
	 * Handles an interaction created by a button or modal component. Use this for button and modal files associated with the guild settings embed system.
	 * @param {BaseInteraction} interaction 
	 */
	public async handleComponentInteraction (interaction?: BaseInteraction): Promise<void> {
		if (interaction) this.interaction = interaction;

		if (this.interaction instanceof ButtonInteraction) {
			if (this.interaction.customId === "guildSettingsCategoryEdit") {
				//Edit this.category based on select menu input
				//Run this.navigateEmbedByCategory with the category given
			} else if (this.interaction.customId === "guildSettingsCategoryToggle"){
				//Edit the enabled property of the category based on select menu input
			} else {
				//Show modal 
			}

		} else if (this.interaction instanceof ModalSubmitInteraction) {
			//Edit the settings schema based on input data
		} else return;
	}

	/**
	 * Directly change the guild setting system's embed page to a specified category.
	 * @param {SettingsCategories|string} category 
	 */
	public async navigateEmbedByCategory (category: SettingsCategories|string): Promise<void> {
		this.currentCategory = category;
		await this.editEmbed(category);
	}


	/**
	 * Edits this.data to the embed data associated with the specified category.
	 * @param {SettingsCategories|string} category 
	 */
	private async editEmbed (category: SettingsCategories|string): Promise<void> {
		if (category === "home") this.data = this.homepage;
		else this.data = await this.constructEmbed(category);
	}

	/**
	 * Scrapes data off the guild settings mongo schema, and designs an embed out of it. The embed is returned as a raw object.
	 * @param {SettingsCategories|string} category 
	 * @returns {APIEmbed}
	 */
	private async constructEmbed (category: string): Promise<APIEmbed> {
		const schema = await guildSettingsSchema.findOne({ id: this.interaction.guild?.id });
		if (!schema) throw new Error("Could not find guild settings schema with id " + this.interaction.guild?.id);

		return new EmbedBuilder()
			.setAuthor({ name: `${this.interaction.guild?.name}`, iconURL: this.interaction.guild?.iconURL() ?? undefined })
			.setTitle(`${capitaliseFirst(category)} Settings`)
			.setColor(schema[category as keyof typeof schema].appearance.colour)
			.setDescription(blockQuote(`Here are the settings for the category ${inlineCode(category)}. To make changes to a setting, choose a setting with the select menu below, then press ${inlineCode("edit")}.`))
			.setFooter({ text: `Settings & Preferences - ${capitaliseFirst(category)}`, iconURL: schema[category as keyof typeof schema].appearance.icon })
			.setTimestamp(Date.now())
			.setThumbnail(schema[category as keyof typeof schema].appearance.icon)
			.toJSON();
	}
}

