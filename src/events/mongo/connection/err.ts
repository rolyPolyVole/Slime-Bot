import {MongoEvent} from "types";
import {MongooseError} from "mongoose";
import chalk from "chalk";

const {bold, redBright} = chalk;

export const err: MongoEvent = {
	execute(error: MongooseError) {
		console.log(redBright(`\n${bold("[Database Status]")} ${error.name}`));
		console.error(error);
		console.log();
	},
};
