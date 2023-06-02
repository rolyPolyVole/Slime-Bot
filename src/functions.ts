import {readdirSync} from "fs";

/**
 * A function to loop over a folder containing categories, which themselves contain files. The files are passed as parameters to a callback function. Information about the files is logged to the console.
 * @param {string} path The path to the folder containing the categories. (from the src directory)
 * @param {(file: string) => void} callback The callback function to be called on each file.
 */
export const loopFolders = async (path: string, callback: (exports: unknown, filePath: string) => Promise<void>) => {
	const categories = readdirSync(`./dist/${path}/`); // The path starts at src (dist) because most use cases of this function will start there anyway.

	for (const category of categories) {
		const categoryFiles = readdirSync(`./dist/${path}/${category}`).filter((file) => !file.endsWith(".js.map"));

		for (const file of categoryFiles) {
			const fileExports = await import(`../dist/${path}/${category}/${file}`);

			// If there is only one export, as is in the case of files such as handleCommands, then only that export is passed into the function.
			// If it weren't for this check, then an object with only one property would be passed, making the code a bit more cluttered.
			// Implementing this is easier than using "export default" everywhere as that can get a bit cluttered when using type declarations.
			await callback(
				Object.keys(fileExports).length === 1 ? fileExports[Object.keys(fileExports)[0]] : fileExports,
				`./dist/${path}/${category}/${file}`
			);
		}
	}
};
