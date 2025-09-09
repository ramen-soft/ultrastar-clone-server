import { NextFunction, Request, Response } from "express";
import { decodeToken, TokenType } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export const authenticateToken = (
	req: Request & { user?: { id: string } },
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies["access_token"];

	if (!token)
		return res.status(401).json({ message: "Access token required" });

	if (!process.env.USTAR_JWT_SECRET) {
		console.error(`JWT secret not defined in environment variables.`);
		return res.status(500).json({ message: "Unable to authenticate" });
	}

	try {
		const payload = decodeToken(
			token,
			TokenType.ACCESS_TOKEN
		) as JwtPayload;
		req.user = { id: payload.userId };
		next();
	} catch (err) {
		return res.status(403).json({ message: "Invalid or expired token" });
	}
};
