import { Dialect } from "sequelize";
import dotenv from "dotenv";
import createLogger from "../../utils/Logger";

dotenv.config();

const debug = createLogger(__filename);

interface Pool {
	max: number; // Maximum number of connections in the pool
	min: number; // Minimum number of connections in the pool
	acquire: number; // Maximum time (in ms) Sequelize will wait for a connection before throwing an error
	idle: number; // Maximum time (in ms) a connection can be idle before being released
}

interface BaseDB {
	dialect: Dialect;
	pool: Pool;
	logging?(msg: any): void; // Enable detailed logging
	port?: number;
	host?: string;
}

interface OnlineDB extends BaseDB {
	use_env_variable?: string;
	username?: never;
	password?: never;
	database?: never;
}

interface LocalDB extends BaseDB {
	use_env_variable?: string | undefined;
	username: string;
	password: string;
	database: string;
}

type IConfig = {
	[key: string]: OnlineDB | LocalDB;
};
// development: OnlineDB | LocalDB;
// test: OnlineDB | LocalDB;
// preview: OnlineDB;
// production: OnlineDB;

// If using local database
const config: IConfig = {
	development: {
		database: process.env.DB_NAME!,
		username: process.env.DB_USER!,
		password: process.env.DB_PASS!,
		host: process.env.DB_HOST,
		port: 5432,
		dialect: "postgres",
		pool: {
			max: 10, // Maximum number of connections in the pool
			min: 2, // Minimum number of connections in the pool
			acquire: 30000, // Maximum time (in ms) Sequelize will wait for a connection before throwing an error
			idle: 10000, // Maximum time (in ms) a connection can be idle before being released
		},
		logging: (msg: any): void => debug(`[Sequelize]: ${msg}`),
	},
	test: {
		database: process.env.DB_NAME!,
		username: process.env.DB_USER!,
		password: process.env.DB_PASS!,
		host: process.env.DB_HOST,
		port: 5432,
		dialect: "postgres",
		pool: {
			max: 10, // Maximum number of connections in the pool
			min: 2, // Minimum number of connections in the pool
			acquire: 30000, // Maximum time (in ms) Sequelize will wait for a connection before throwing an error
			idle: 10000, // Maximum time (in ms) a connection can be idle before being released
		},
		logging: (msg: any): void => debug(`[Sequelize]: ${msg}`),
	},
	preview: {
		use_env_variable: "DB_URL",
		dialect: "postgres",
		pool: {
			max: 10, // Maximum number of connections in the pool
			min: 2, // Minimum number of connections in the pool
			acquire: 30000, // Maximum time (in ms) Sequelize will wait for a connection before throwing an error
			idle: 10000, // Maximum time (in ms) a connection can be idle before being released
		},
		logging: (msg: any): void => debug(`[Sequelize]: ${msg}`),
	},
	production: {
		use_env_variable: "PROB_DB_URL",
		dialect: "postgres",
		pool: {
			max: 10, // Maximum number of connections in the pool
			min: 2, // Minimum number of connections in the pool
			acquire: 30000, // Maximum time (in ms) Sequelize will wait for a connection before throwing an error
			idle: 10000, // Maximum time (in ms) a connection can be idle before being released
		},
		logging: (msg: any): void => debug(`[Sequelize]: ${msg}`),
	},
};

export default config;
