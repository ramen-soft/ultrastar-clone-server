import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
dotenv.config({ path: [".env.local", ".env"] });

const PORT = process.env.PORT || 3000;

//initialize express server
const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	})
);

app.get("/", (req: Request, res: Response) => {
	return res.status(200).send(`Hello, world!`);
});

const server = createServer(app);

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
