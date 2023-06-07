import chalk from "chalk";
import {MongoEvent} from "types";

const {cyan, bold} = chalk;

export const connecting: MongoEvent = {
	execute() {
		console.log(cyan(`\n${bold("[Database Status]")} Connecting...\n`));
	}
};
