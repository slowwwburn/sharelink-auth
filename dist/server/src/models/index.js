"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.closeDatabase = void 0;
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
const config_1 = __importDefault(require("../config/config"));
dotenv_1.default.config();
const log = (0, Logger_1.default)(__filename);
const basename = path_1.default.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = config_1.default[env];
const db = {};
let sequelize;
console.log(config);
if (config.use_env_variable !== undefined) {
    sequelize = new sequelize_1.Sequelize(process.env[config.use_env_variable], config);
}
else {
    sequelize = new sequelize_1.Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        pool: config.pool,
    });
}
fs_1.default.readdirSync(__dirname)
    .filter((file) => {
    return (file.indexOf(".") !== 0 &&
        file !== basename &&
        file.slice(-3) === ".ts" &&
        file.indexOf(".test.ts") === -1);
})
    .forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
    const { default: model } = yield Promise.resolve(`${path_1.default.join(__dirname, file)}`).then(s => __importStar(require(s)));
    const initializedModel = model(sequelize, sequelize_1.DataTypes);
    db[initializedModel.name] = initializedModel;
}));
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = sequelize_1.Sequelize;
let retryAttempts = 5;
function connectWithRetry() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            log("Database connection has been established successfully.");
        }
        catch (error) {
            log(`Unable to connect to the database: ${JSON.stringify(error)}`);
            retryAttempts -= 1;
            if (retryAttempts > 0) {
                setTimeout(connectWithRetry, 5000);
            }
            else {
                log("Max retry attempts reached.");
            }
        }
    });
}
connectWithRetry();
const closeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    yield sequelize.close();
    log("Database connection closed");
});
exports.closeDatabase = closeDatabase;
exports.default = db;
