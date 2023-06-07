import {Event} from "types";
import chalk from "chalk";

const {bold, redBright} = chalk;

export const debug: Event<"error"> = {
	async execute(_client, error) {
		console.log(redBright(`\n${bold("[Error]")} ${error.name}`));
		console.error(error);
		console.log();
	}
};
