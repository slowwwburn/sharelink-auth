import debug, { Debugger } from "debug";
import path from "path";

const createLogger = (filePath: string) => {
	const file = path.basename(filePath, path.extname(filePath));

	const logger = debug(`app:${file}`);

	return (...message: any) => {
		const timestamp = new Date().toISOString();
		// const linenumber = getLineNumber()
		const formattedMessage = message
			.map((msg: any) => (typeof msg === "object" ? JSON.stringify(msg) : msg))
			.join(" ");

		logger(`${timestamp} - ${formattedMessage}`);
	};
};

export default createLogger;
