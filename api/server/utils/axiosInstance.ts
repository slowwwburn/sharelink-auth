import axios from "axios";
import createLogger from "./Logger";
// import type { AxiosRequestConfig } from "axios";

const log = createLogger(__filename);

// Create two axios instances
const integrationAxios = axios.create({});
const walletAxios = axios.create({});
const axiosInstance2 = axios.create({});

let prembly_sk: string | undefined, prembly_app_id: string | undefined;

if (process.env.NODE_ENV === "development") {
	prembly_sk = process.env.prembly_DEV_SECRET;
	prembly_app_id = process.env.prembly_DEV_APP_ID;
} else if (process.env.NODE_ENV === "production") {
	prembly_sk = process.env.prembly_SECRET;
	prembly_app_id = process.env.prembly_APP_ID;
}
// Interceptor for the first axios instance
integrationAxios.interceptors.request.use(
	(config: any) => {
		config.headers = {
			...config.headers,
			accept: "application/json",
			"app-id": prembly_app_id,
			"x-api-key": prembly_sk,
		};

		// Base URL for the authentication API
		config.baseURL = process.env.integrations_BASE_URL;
		config.withCredentials = true;

		// console.log("Axios Request Config (auth):", config);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

walletAxios.interceptors.request.use(
	(config: any) => {
		config.headers = {
			...config.headers,
			API_KEY: process.env.API_KEY,
		};
		config.baseURL = process.env.wallet_BASE_URL;
		config.withCredentials = true;

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

integrationAxios.interceptors.response.use(
	(response) => {
		// Any status code that lies within the range of 2xx causes this function to trigger
		return response;
	},
	(error) => {
		// Any status codes that falls outside the range of 2xx causes this function to trigger
		if (error.response) {
			// The request was made and the server responded with a status code
			log(
				`Error response from microservice: ${error.response.status} - ${error.response.data}`
			);
		} else if (error.request) {
			// The request was made but no response was received
			log("No response received from microservice", error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			log("Error in setting up the request", error.message);
		}
		return Promise.reject(error);
	}
);

// Interceptor for the second axios instance
axiosInstance2.interceptors.request.use(
	(config: any) => {
		// Extract token from the URL query parameters
		const query = new URLSearchParams(window.location.search);
		const token = query.get("token");

		if (token) {
			// Add Authorization header with the token
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`,
			};
		}

		// Base URL for the API
		config.baseURL = process.env.REACT_APP_API_BASE_URL;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

console.log(process.env.REACT_APP_API_KEY);

export { integrationAxios, axiosInstance2, walletAxios };
