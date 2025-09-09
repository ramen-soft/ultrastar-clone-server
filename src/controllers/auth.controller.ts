import { Request, Response } from "express";
import * as authService from "../services/auth.service";

const MAX_AGE_ACCESS_TOKEN = 15 * 60 * 1000; // Access token: 15 minutos
const MAX_AGE_REFRESH_TOKEN = 7 * 24 * 60 * 60 * 1000; // Refresh token: 7 días

const cookieOptions = {
	httpOnly: true,
	path: "/",
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict" as const,
};
/**
 * Controlador para manejar el inicio de sesión de un usuario.
 *
 * @param {Request} req - Objeto de la solicitud HTTP que contiene `username` y `password` en el body.
 * @param {Response} res - Objeto de la respuesta HTTP usado para establecer cookies y devolver el estado.
 * @returns {Promise<void>} Envía una respuesta HTTP:
 * - 200 si las credenciales son válidas, estableciendo cookies de `access_token` y `refresh_token`.
 * - 401 si las credenciales son inválidas.
 */
const loginHandler = async (req: Request, res: Response) => {
	const { username, password } = req.body;
	const result = await authService.login(username, password);

	if (!result) {
		return res.status(401).json({ message: "Invalid credentials" });
	}

	res.cookie("refresh_token", result.refreshToken, {
		...cookieOptions,
		path: "/auth/refresh",
		maxAge: MAX_AGE_REFRESH_TOKEN,
	});
	res.cookie("access_token", result.accessToken, {
		...cookieOptions,
		maxAge: MAX_AGE_ACCESS_TOKEN,
	});

	res.status(200).json({ logged: true, ...result.user });
};

/**
 * Controlador para manejar el cierre de sesión de un usuario.
 *
 * @param {Request} req - Objeto de la solicitud HTTP que debe contener la cookie `access_token`.
 * @param {Response} res - Objeto de la respuesta HTTP usado para limpiar cookies y devolver el estado.
 * @returns {Promise<void>} Envía una respuesta HTTP:
 * - 200 si el logout se realizó correctamente y las cookies fueron eliminadas.
 * - 503 si no se pudo cerrar sesión o no se proporcionó un token válido.
 */
const logoutHandler = async (req: Request, res: Response) => {
	const token = req.cookies["access_token"];
	if (!token) {
		return res.status(400).json({
			message: "Invalid request",
		});
	}

	try {
		await authService.logout(token);
		res.clearCookie("access_token");
		res.clearCookie("refresh_token");
		return res.status(200).json({
			logged: false,
		});
	} catch (error) {
		return res.status(503).json({
			message: "Unable to log out",
		});
	}
};

/**
 * Controlador para manejar la renovación del token de acceso.
 *
 * @param {Request} req - Objeto de la solicitud HTTP que debe contener la cookie `refresh_token`.
 * @param {Response} res - Objeto de la respuesta HTTP usado para devolver un nuevo `access_token` y el estado.
 * @returns {Promise<void>} Envía una respuesta HTTP:
 * - 200 con un nuevo `access_token` si el refresh token es válido.
 * - 200 si no se envió refresh token.
 * - 403 si el refresh token es inválido o expiró.
 */
const refreshTokenHandler = async (req: Request, res: Response) => {
	const token = req.cookies["refresh_token"];

	if (!token) {
		return res.status(200).json({
			message: "No refresh token provided",
		});
	}
	try {
		const newAccessToken = await authService.refresh(token);
		if (!newAccessToken) {
			return res.status(403).json({
				message: "Invalid or expired refresh token",
			});
		} else {
			res.cookie("access_token", newAccessToken, {
				...cookieOptions,
				maxAge: MAX_AGE_ACCESS_TOKEN,
			});

			res.status(200).json({ status: "ok" });
		}
	} catch (error) {
		res.status(403).json({ message: "Invalid or expired refresh token" });
	}
};

export { loginHandler, logoutHandler, refreshTokenHandler };
