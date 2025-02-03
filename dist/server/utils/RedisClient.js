"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = void 0;
const redis_1 = require("redis");
const Logger_1 = __importDefault(require("./Logger"));
const log = (0, Logger_1.default)(__filename);
const redis = (0, redis_1.createClient)({
    url: "redis://localhost:6379",
});
redis.on("ready", () => log("Connected to Redis successfully"));
redis.on("error", (err) => log("Redis Client Error", err));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis.connect();
    }
    catch (err) {
        log("Error connecting to Redis:", err.message);
    }
}))();
const closeRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield redis.quit();
    log("Redis connection closed");
});
exports.closeRedis = closeRedis;
exports.default = redis;
