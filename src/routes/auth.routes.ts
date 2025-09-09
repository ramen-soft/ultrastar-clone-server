import { Request, Response, Router } from "express";
import {
	logoutHandler,
	refreshTokenHandler,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/refresh", refreshTokenHandler);
authRouter.post("/logout", logoutHandler);

export { authRouter };
