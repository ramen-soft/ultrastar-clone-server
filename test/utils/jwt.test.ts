import {
	decodeToken,
	generateRefreshToken,
	generateToken,
	refreshAccessToken,
	TokenType,
} from "../../src/utils/jwt";

describe("Conjunto de tests para las funciones utilitarias de JWT", () => {
	beforeAll(() => {});
	test("Si no esta seteada la variable de entorno, la generacion de access token debe fallar", () => {
		expect(() => generateToken({})).toThrow();
	});

	test("Si no esta seteada la variable de entorno, la generación de refresh token debe fallar", () => {
		expect(() => generateRefreshToken({})).toThrow();
	});

	test("Puede generar un access token", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		const token = generateToken({ user: 1 });
		expect(token).toBeDefined();
	});

	test("Puede generar un refresh token", () => {
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		const token = generateRefreshToken({ user: 1 });
		expect(token).toBeDefined();
	});

	test("Si el access token caduca, decodeToken debe devolver null", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		const token = generateToken({ user: 1 }, { expiresIn: "0s" });

		const decoded = decodeToken(token, TokenType.ACCESS_TOKEN);

		expect(decoded).toBeNull();
	});

	test("Si el refresh token caduca, decodeToken debe devolver null", () => {
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		const token = generateToken({ user: 1 }, { expiresIn: "0s" });

		const decoded = decodeToken(token, TokenType.REFRESH_TOKEN);

		expect(decoded).toBeNull();
	});

	test("Debe devolver un access token si se pasa un refresh token", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		const token = generateRefreshToken({ userId: 4 });
		const newToken = refreshAccessToken(token);
		expect(newToken).not.toBeNull();
	});

	test("generateRefreshToken: Si refresh token caduca, debe lanzar un error", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		const token = generateRefreshToken({ userId: 4 }, { expiresIn: "0s" });
		expect(() => refreshAccessToken(token)).toThrow();
	});

	test("generateRefreshToken: Si no hay userId, debe lanzar un error", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		const token = generateRefreshToken({});
		expect(() => refreshAccessToken(token)).toThrow();
	});

	test("generateRefreshToken: Si el refresh token no es valido, debe lanzar un error", () => {
		process.env.USTAR_JWT_SECRET = "test-secret";
		process.env.USTAR_JWT_REFRESH_SECRET = "test-secret";
		expect(() => refreshAccessToken("invalidtoken")).toThrow();
	});
});
