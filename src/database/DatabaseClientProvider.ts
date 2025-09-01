import { IDatabaseClient } from "./IDatabaseClient";

let clientInstance: IDatabaseClient | null = null;

const setDatabaseClient = (client: IDatabaseClient): void => {
	clientInstance = client;
};

const getDatabaseClient = (): IDatabaseClient => {
	if (!clientInstance)
		throw new Error(
			"Database client is not set. Please initialize it first."
		);
	return clientInstance;
};

export { setDatabaseClient, getDatabaseClient };
