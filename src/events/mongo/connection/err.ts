import chalk from "chalk";

export const err = {
	execute(error: Error) {
		console.log(
			chalk.cyan(`${chalk.bold("\n[Database Status]")} An error occurred with the database connection: \n${error}\n`)
		);
	}
};
