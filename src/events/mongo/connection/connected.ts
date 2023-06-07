import chalk from "chalk";
import {MongoEvent} from "types";

const {green, bold} = chalk;

export const connected: MongoEvent = {
	execute() {
		console.log(green(`\n${bold("[Database Status]")} Connected.\n`));
	}
};
