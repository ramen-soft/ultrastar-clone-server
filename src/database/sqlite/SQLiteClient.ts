import { IDatabaseClient } from "../IDatabaseClient";
import { open, Database } from "sqlite";
import sqlite from "sqlite3";

export class SQLiteClient implements IDatabaseClient {
	private db: Database;

	private constructor(db: Database) {
		this.db = db;
	}

	static async create(filename: string): Promise<SQLiteClient> {
		const db = await open({
			filename,
			driver: sqlite.Database,
		});

		await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                refresh_token TEXT
            );
        `);

		return new SQLiteClient(db);
	}

	async find(query: string, params?: any[]): Promise<any[]> {
		return this.db.all(query, params);
	}

	async findOne(query: string, params?: any[]): Promise<any> {
		return this.db.get(query, params);
	}

	async execute(query: string, params?: any[]): Promise<any> {
		return this.db.run(query, params);
	}

	async close() {
		await this.db.close();
	}
}
