import {Event} from "types";
import chalk from "chalk";

const {redBright, bold} = chalk;

export const debug: Event<"shardError"> = {
	async execute(_client, error) {
		console.log(redBright(`\n${bold("[Shard Error]")} ${error.name}\n`));
		console.error(error);
		console.log("\n");
	}
};
