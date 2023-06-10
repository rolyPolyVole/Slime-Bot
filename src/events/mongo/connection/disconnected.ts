import {MongoEvent} from "types";
import chalk from "chalk";

const {red, bold} = chalk;

export const disconnected: MongoEvent = {
	execute() {
		console.log(red(`\n${bold("[Database Status]")} Disconnected.\n`));
	},
};
