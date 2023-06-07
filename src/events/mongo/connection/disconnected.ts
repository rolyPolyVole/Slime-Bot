import chalk from "chalk";
import {MongoEvent} from "types";

const {red, bold} = chalk;

export const disconnected: MongoEvent = {
	execute() {
		console.log(red(`\n${bold("[Database Status]")} Disconnected.\n`));
	}
};
