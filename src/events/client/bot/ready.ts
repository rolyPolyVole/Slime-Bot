import {Event} from "types";
import chalk from "chalk";

const {bold, whiteBright, greenBright} = chalk;

export const ready: Event<"ready"> = {
	once: true,
	async execute(client) {
		console.log(
			whiteBright(`\n${bold("[Client]")} Ready! Online and logged in as ${greenBright(client.user?.username)}.\n`)
		);

		setInterval(async () => await client.checkUploads(), 60000);
	}
};
