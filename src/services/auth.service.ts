import { getUserRepository } from "../repositories/UserRepository";
import bcrypt from "bcrypt";
import {
	decodeToken,
	generateRefreshToken,
	generateToken,
	refreshAccessToken,
	TokenType,
} from "../utils/jwt";
import { User } from "../models/User";

type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

type LoginResult = AuthTokens & { user: Omit<User, "password"> };

/**
 * Inicia sesión con un usuario y contraseña.
 *
 * @param {string} username - Nombre de usuario a autenticar.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<AuthTokens | null>} Retorna los tokens de acceso y refresco si las credenciales son válidas, de lo contrario `null`.
 */

const login = async (
	username: string,
	password: string
): Promise<LoginResult | null> => {
	const userRepository = await getUserRepository();
	const user = await userRepository.findByUsername(username);
	console.log(user);

	if (!user) {
		return null; //User not found
	}
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		return null;
	}

	try {
		const accessToken = generateToken({ userId: user.id });
		const refreshToken = generateRefreshToken({ userId: user.id });
		userRepository.updateRefreshToken(user.id, refreshToken);

		const { password, ...userinfo } = user;
		return {
			accessToken,
			refreshToken,
			user: userinfo,
		};
	} catch (err) {
		console.error(err);
	}
	return null;
};

/**
 * Cierra la sesión de un usuario invalidando su refresh token.
 *
 * @param {string} accessToken - Token de acceso válido del usuario.
 * @returns {Promise<void>} No retorna valor. Lanza un error si no se puede decodificar o invalidar el token.
 */
const logout = async (accessToken: string): Promise<void> => {
	const userRepository = await getUserRepository();
	try {
		const decoded = decodeToken(accessToken, TokenType.ACCESS_TOKEN);
		if (!decoded) {
			throw new Error("Unable to decode token.");
		} else {
			const { userId } = decoded;
			if (!userId) {
				throw new Error("Invalid access token: no userId");
			}
			await userRepository.updateRefreshToken(userId, "");
		}
	} catch (error) {
		console.error("Error during logout", error);
	}
};

/**
 * Refresca un token de acceso utilizando un refresh token válido.
 *
 * @param {string} refreshToken - Token de refresco del usuario.
 * @returns {Promise<string | null>} Retorna un nuevo token de acceso si el refresh token es válido, de lo contrario `null`.
 */
const refresh = async (refreshToken: string): Promise<string | null> => {
	const userRepository = await getUserRepository();
	try {
		const decoded = decodeToken(refreshToken, TokenType.REFRESH_TOKEN);

		if (decoded) {
			const { userId } = decoded;

			if (!userId) {
				throw new Error("Invalid refresh token: no userId");
			}

			const validToken = await userRepository.checkRefreshToken(
				userId,
				refreshToken
			);

			if (!validToken) {
				throw new Error("Invalid refresh token: not found in database");
			}

			// If token is valid, generate a new access token:
			const newAccessToken = refreshAccessToken(refreshToken);
			return newAccessToken;
		} else {
			throw new Error("Unable to decode token");
		}
	} catch (error) {
		console.error("Error refreshing token: ", error);
		return null;
	}
};

export { login, logout, refresh };
