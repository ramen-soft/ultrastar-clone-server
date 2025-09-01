import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { SQLiteClient } from "./database/sqlite/SQLiteClient";
import { setDatabaseClient } from "./database/DatabaseClientProvider";
dotenv.config({ path: [".env.local", ".env"] });

const PORT = process.env.USTAR_BACKEND_PORT || 3000;

//Initialize database
const db = await SQLiteClient.create(
	process.env.USTAR_DATABASE_PATH || "./db.sqlite"
);
setDatabaseClient(db);

//initialize express server
const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.USTAR_CLIENT_URL || "http://localhost:5173",
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
