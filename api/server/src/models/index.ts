"use strict";
import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import createLogger from "../../utils/Logger";
import configFile from "../config/config";

dotenv.config();

const log = createLogger(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];
const db: { [key: string]: any } = {};

let sequelize: Sequelize;

console.log(config);

if (config.use_env_variable !== undefined) {
	sequelize = new Sequelize(process.env[config.use_env_variable]!, config);
} else {
	sequelize = new Sequelize(
		config.database!,
		config.username!,
		config.password!,
		// config,
		{
			host: config.host,
			dialect: config.dialect,
			pool: config.pool,
		}
	);
}

// log(sequelize);
fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 &&
			file !== basename &&
			(file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
			file.indexOf(".test.ts") === -1 && file.indexOf(".test.js") === -1
		);
	})
	.forEach(async (file) => {
		const { default: model } = await import(path.join(__dirname, file));
		const initializedModel = model(sequelize, DataTypes);
		db[initializedModel.name] = initializedModel;
	});

Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// authenticateDb();

let retryAttempts = 5;
async function connectWithRetry() {
	try {
		await sequelize.authenticate();
		log("Database connection has been established successfully.");
	} catch (error) {
		log(`Unable to connect to the database: ${JSON.stringify(error)}`);
		retryAttempts -= 1;
		if (retryAttempts > 0) {
			setTimeout(connectWithRetry, 5000);
		} else {
			log("Max retry attempts reached.");
		}
	}
}

connectWithRetry();

export const closeDatabase = async () => {
	await sequelize.close();
	log("Database connection closed");
};

export default db;
