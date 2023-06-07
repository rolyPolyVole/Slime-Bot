import chalk from "chalk";
import {MongooseError} from "mongoose";
import {MongoEvent} from "types";

const {bold, redBright} = chalk;

export const err: MongoEvent = {
	execute(error: MongooseError) {
		console.log(redBright(`\n${bold("[Database Status]")} ${error.name}`));
		console.error(error);
		console.log();
	}
};
