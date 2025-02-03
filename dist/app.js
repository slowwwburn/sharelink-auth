"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const Logger_1 = __importDefault(require("./server/utils/Logger"));
const RedisClient_1 = require("./server/utils/RedisClient");
const index_1 = require("./server/src/models/index");
const UserRoutes_1 = __importDefault(require("./server/routes/UserRoutes"));
const AuthRoutes_1 = __importDefault(require("./server/routes/AuthRoutes"));
const log = (0, Logger_1.default)(__filename);
const app = (0, express_1.default)();
const cookieParser = require("cookie-parser");
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8200",
    "http://dashboard.localhost:3001",
];
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: true,
}));
app.use((err, req, res, next) => {
    if (err.message === "CORS policy violation") {
        log("CORS Error: ", err);
        res.status(403).json({ message: err.message });
    }
    else {
        next(err);
    }
});
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
log("Booting up theGate servers");
log("Creating routes into servers");
const base = "/api";
app.use(`${base}/v1/user`, UserRoutes_1.default);
app.use(`${base}/v1/auth`, AuthRoutes_1.default);
app.all("*", (req, res) => res.status(404).json({
    message: `${req.originalUrl} not found.`,
}));
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
        console.error("🚨 Memory usage approaching limit! Potential leak detected.");
    }
}, 10000 * 60);
function cleanupAndExit() {
    const closeServer = new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                log("Error while closing server: ", err);
                reject(err);
            }
            else {
                log("Server closed");
                resolve();
            }
        });
    });
    Promise.all([closeServer, (0, RedisClient_1.closeRedis)(), (0, index_1.closeDatabase)()])
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
exports.default = app;
