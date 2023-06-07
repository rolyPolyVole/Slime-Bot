import chalk from "chalk";

export const connected = {
	execute() {
		console.log(chalk.green(`\n${chalk.bold("[Database Status]")} Connected.\n`));
	}
};
