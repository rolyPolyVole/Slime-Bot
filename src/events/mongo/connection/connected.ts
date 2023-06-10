import {MongoEvent} from "types";
import chalk from "chalk";

const {green, bold} = chalk;

export const connected: MongoEvent = {
	execute() {
		console.log(green(`\n${bold("[Database Status]")} Connected.\n`));
	},
};
