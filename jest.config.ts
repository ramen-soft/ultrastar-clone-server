import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest/presets/default-esm", // para TypeScript + ESM
	testEnvironment: "node",
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1", // corrige imports .js en TypeScript ESM
	},
};

export default config;
