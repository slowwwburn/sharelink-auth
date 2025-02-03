import { createClient, RedisClientType } from "redis";
import createLogger from "./Logger";

const log = createLogger(__filename);

const redis: RedisClientType = createClient({
	url: "redis://localhost:6379",
});

redis.on("ready", () => log("Connected to Redis successfully"));

redis.on("error", (err) => log("Redis Client Error", err));

(async () => {
	try {
		await redis.connect();
	} catch (err: any) {
		log("Error connecting to Redis:", err.message);
	}
})();

export const closeRedis = async () => {
	await redis.quit();
	log("Redis connection closed");
};

export default redis;
