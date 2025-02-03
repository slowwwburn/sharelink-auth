"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const createLogger = (filePath) => {
    const file = path_1.default.basename(filePath, path_1.default.extname(filePath));
    const logger = (0, debug_1.default)(`app:${file}`);
    return (...message) => {
        const timestamp = new Date().toISOString();
        const formattedMessage = message
            .map((msg) => (typeof msg === "object" ? JSON.stringify(msg) : msg))
            .join(" ");
        logger(`${timestamp} - ${formattedMessage}`);
    };
};
exports.default = createLogger;
