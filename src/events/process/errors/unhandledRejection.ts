import {ProcessEvent} from "types";

export const unhandledRejection: ProcessEvent = {
	execute(...args) {
		console.error(`Unhandled Rejection:`, ...args);
	}
};
