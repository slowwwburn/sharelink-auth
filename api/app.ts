import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import createLogger from "./server/utils/Logger";
import Util from "./server/utils/Util";
import { closeRedis } from "./server/utils/RedisClient";
import { closeDatabase } from "./server/src/models/index";
import User from "./server/routes/UserRoutes";
import Auth from "./server/routes/AuthRoutes";

const log = createLogger(__filename);
const app = express();
const cookieParser = require("cookie-parser");
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:8200",
	"http://dashboard.localhost:3001",
];
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	max: 100,
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
// app.use(limiter);
app.use(
	cors({
		credentials: true,
		origin: true,
		// 		origin: (origin, callback) => {
		// 			log("This is the origin ", origin);
		// 			if (origin && allowedOrigins.includes(origin)) {
		// 				callback(null, true);
		// 			} else {
		// 				const error = new Error("CORS policy violation");
		// 				callback(error); // Pass the error to Express error handler
		// 			}
		// 		},
	})
);

// Custom Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err.message === "CORS policy violation") {
		log("CORS Error: ", err); // Log the error
		res.status(403).json({ message: err.message }); // Custom CORS response
	} else {
		next(err); // Forward other errors to the default error handler
	}
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

log("Booting up theGate servers");
log("Creating routes into servers");

const base = "/api";
app.use(`${base}/v1/user`, User);
app.use(`${base}/v1/auth`, Auth);
app.all("*", (req: Request, res: Response) =>
	res.status(404).json({
		message: `${req.originalUrl} not found.`,
	})
);
// app.get("*", (req: Request, res: Response) =>
// 	res.status(404).send({
// 		message: req,
// 	})
// );

log("routes created");

const server = app.listen(port, () => {
	log(`Server is running on PORT ${port}`);
});

const THRESHOLD_PERCENTAGE = 0.8;
const MAX_MEMORY_MB = 512;
setInterval(() => {
	const memoryUsage = process.memoryUsage();
	const rssUsedMB = memoryUsage.rss / 1024 / 1024;
	const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
	const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
	const memoryLeftMB = MAX_MEMORY_MB - rssUsedMB;
	const heapUsedPercentage = (heapUsedMB / heapTotalMB) * 100;
	log(`RSS Used: ${rssUsedMB.toFixed(2)} MB`);
	log(`Heap Total: ${heapTotalMB.toFixed(2)} MB`);
	log(`Heap Used: ${heapUsedMB.toFixed(2)} MB`);
	log(`Memory Left: ${memoryLeftMB.toFixed(2)} MB`);
	log(`Heap Usage: ${heapUsedPercentage.toFixed(2)}%`);
	if (heapUsedPercentage > THRESHOLD_PERCENTAGE * 100) {
		console.error(
			"🚨 Memory usage approaching limit! Potential leak detected."
		);
	}
}, 10000 * 60);

function cleanupAndExit() {
	const closeServer = new Promise<void>((resolve, reject) => {
		server.close((err) => {
			if (err) {
				log("Error while closing server: ", err);
				reject(err);
			} else {
				log("Server closed");
				resolve();
			}
		});
	});

	Promise.all([closeServer, closeRedis(), closeDatabase()])
		.then(() => {
			log("All resources closed, exiting...");
			process.exit(0);
		})
		.catch((err) => {
			log("Error during cleanup: ", err);
			process.exit(1);
		});
}

process.once("SIGTERM", cleanupAndExit);
process.once("SIGINT", cleanupAndExit);

export default app;
