import chalk from "chalk";

export const disconnected = {
	execute() {
		console.log(chalk.red(`\n${chalk.bold("[Database Status]")} Disconnected.\n`));
	}
};
