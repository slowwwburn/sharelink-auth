"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletAxios = exports.axiosInstance2 = exports.integrationAxios = void 0;
const axios_1 = __importDefault(require("axios"));
const Logger_1 = __importDefault(require("./Logger"));
const log = (0, Logger_1.default)(__filename);
const integrationAxios = axios_1.default.create({});
exports.integrationAxios = integrationAxios;
const walletAxios = axios_1.default.create({});
exports.walletAxios = walletAxios;
const axiosInstance2 = axios_1.default.create({});
exports.axiosInstance2 = axiosInstance2;
let prembly_sk, prembly_app_id;
if (process.env.NODE_ENV === "development") {
    prembly_sk = process.env.prembly_DEV_SECRET;
    prembly_app_id = process.env.prembly_DEV_APP_ID;
}
else if (process.env.NODE_ENV === "production") {
    prembly_sk = process.env.prembly_SECRET;
    prembly_app_id = process.env.prembly_APP_ID;
}
integrationAxios.interceptors.request.use((config) => {
    config.headers = Object.assign(Object.assign({}, config.headers), { accept: "application/json", "app-id": prembly_app_id, "x-api-key": prembly_sk });
    config.baseURL = process.env.integrations_BASE_URL;
    config.withCredentials = true;
    return config;
}, (error) => {
    return Promise.reject(error);
});
walletAxios.interceptors.request.use((config) => {
    config.headers = Object.assign(Object.assign({}, config.headers), { API_KEY: process.env.API_KEY });
    config.baseURL = process.env.wallet_BASE_URL;
    config.withCredentials = true;
    return config;
}, (error) => {
    return Promise.reject(error);
});
integrationAxios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        log(`Error response from microservice: ${error.response.status} - ${error.response.data}`);
    }
    else if (error.request) {
        log("No response received from microservice", error.request);
    }
    else {
        log("Error in setting up the request", error.message);
    }
    return Promise.reject(error);
});
axiosInstance2.interceptors.request.use((config) => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    if (token) {
        config.headers = Object.assign(Object.assign({}, config.headers), { Authorization: `Bearer ${token}` });
    }
    config.baseURL = process.env.REACT_APP_API_BASE_URL;
    return config;
}, (error) => {
    return Promise.reject(error);
});
console.log(process.env.REACT_APP_API_KEY);
