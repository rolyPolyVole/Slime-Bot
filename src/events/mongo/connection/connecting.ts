import chalk from "chalk";

export const connecting = {
	execute() {
		console.log(chalk.cyan(`\n${chalk.bold("[Database Status]")} Connecting...\n`));
	}
};
