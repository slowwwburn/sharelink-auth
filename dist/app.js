"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
    "http://dashboard.localhost:3001",
];
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        log("This is the origin ", origin);
        if (origin && allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            const error = new Error("CORS policy violation");
            callback(error);
        }
    },
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
const base = "/auth/api";
app.use(`${base}/v1/user`, UserRoutes_1.default);
app.use(`${base}/v1/auth`, AuthRoutes_1.default);
log("routes created");
const server = app.listen(port, () => {
    log(`Server is running on PORT ${port}`);
});
const memoryUsage = process.memoryUsage();
log(`RSS: ${memoryUsage.rss}`);
log(`Heap Total: ${memoryUsage.heapTotal}`);
log(`Heap Used: ${memoryUsage.heapUsed}`);
log(`External: ${memoryUsage.external}`);
function cleanupAndExit() {
    Promise.all([
        server.close(() => log("Server closed")),
        (0, RedisClient_1.closeRedis)(),
        (0, index_1.closeDatabase)(),
    ])
        .then(() => {
        process.exit(0);
    })
        .catch((err) => {
        log("Error while closing a resource: ", err);
        process.exit(1);
    });
}
process.once("SIGTERM", cleanupAndExit);
process.once("SIGINT", cleanupAndExit);
exports.default = app;
