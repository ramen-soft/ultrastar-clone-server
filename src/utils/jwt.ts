import jwt, { JsonWebTokenError, JwtPayload, SignOptions } from "jsonwebtoken";

export enum TokenType {
	ACCESS_TOKEN = "access",
	REFRESH_TOKEN = "refresh",
}

/**
 * Crea un access token firmado con el payload suministrado y lo devuelve.
 *
 * @throws {Error} Si USTAR_JWT_SECRET no está definido en las variables de entorno.
 * @param payload
 * @returns {string} Nuevo JWT token
 */
export const generateToken = (
	payload: JwtPayload,
	options?: SignOptions
): string => {
	if (!process.env.USTAR_JWT_SECRET) {
		throw new Error(
			"USTAR_JWT_SECRET is not defined in environment variables."
		);
	}

	const token = jwt.sign(payload, process.env.USTAR_JWT_SECRET, {
		expiresIn: "7d",
		...options,
	});

	return token;
};

/**
 * Crea un refresh token firmado con el payload suministrado y lo devuelve.
 *
 * @throws {Error} Si USTAR_JWT_REFRESH_SECRET no está definido en las variables de entorno.
 * @param payload
 * @returns {string} Nuevo JWT token
 */
export const generateRefreshToken = (
	payload: JwtPayload,
	options?: SignOptions
): string => {
	if (!process.env.USTAR_JWT_REFRESH_SECRET) {
		throw new Error(
			"JWT_REFRESH_SECRET no está definido en las variables de entorno"
		);
	}

	const refreshToken = jwt.sign(
		payload,
		process.env.USTAR_JWT_REFRESH_SECRET,
		{ expiresIn: "7d", ...options }
	);
	return refreshToken;
};

/**
 * Decodifica un token del tipo especificado utilizando los secrets definidos.
 *
 * @param token Jwt Token
 * @param type TokenType = [ACCESS_TOKEN, REFRESH_TOKEN]
 * @returns {JwtPayload | null} decoded token or null if failed
 */
export const decodeToken = (
	token: string,
	type: TokenType
): JwtPayload | null => {
	let secret: string | undefined;
	if (type === TokenType.ACCESS_TOKEN) {
		secret = process.env.USTAR_JWT_SECRET;
	} else if (type === TokenType.REFRESH_TOKEN) {
		secret = process.env.USTAR_JWT_REFRESH_SECRET;
	}

	if (!secret) {
		throw new Error(
			`Secret for type ${type} not defined in environment variables.`
		);
	}

	try {
		return jwt.verify(token, secret) as JwtPayload;
	} catch (err) {
		return null;
	}
};

/**
 * Crea un nuevo access token a partir de un refresh token.
 *
 * @throws {Error} Si el token es inválido o ha expirado.
 * @throws {Error} Si USTAR_JWT_REFRESH_SECRET no está definido en las variables de entorno.
 * @param refreshToken
 * @returns {string} Nuevo access token.
 */
export const refreshAccessToken = (refreshToken: string): string => {
	if (!process.env.USTAR_JWT_REFRESH_TOKEN) {
		throw new Error(
			"USTAR_JWT_REFRESH_TOKEN is not defined in environment variables."
		);
	}

	const decoded = jwt.verify(
		refreshToken,
		process.env.USTAR_JWT_REFRESH_TOKEN
	) as JwtPayload;

	if (decoded.exp && decoded.exp < Date.now() / 1000) {
		throw new Error("Refresh token has expired.");
	} else if (!decoded.userId) {
		throw new Error("Invalid refresh token.");
	} else if (!decoded) {
		throw new Error("Invalid token.");
	}

	// Generate a new access token
	return generateToken({ userId: decoded.userId });
};
