import { SQLiteClient } from "../../src/database/sqlite/SQLiteClient";
const fs = require("fs");

describe("Conjunto de tests para la funcionalidad de Databases", () => {
	const path = "./tempdb.sqlite";
	let tempDb: SQLiteClient | null = null;

	test("SQLiteClient: puede crear una db", async () => {
		tempDb = await SQLiteClient.create(path);
		expect(tempDb).not.toBeNull();
	});

	test("SQLiteClient: puede insertar una fila", async () => {
		const { total: pre } = await tempDb?.findOne(
			`SELECT COUNT(1) total FROM users`
		);
		await tempDb?.execute(
			`INSERT INTO users (username, password) VALUES (?,?)`,
			["user1", "pass1"]
		);
		const { total: post } = await tempDb?.findOne(
			`SELECT COUNT(1) total FROM users`
		);

		expect(post - pre).toBe(1);
	});

	test("SQLiteClient: puede recuperar filas", async () => {
		const users = await tempDb?.find(`SELECT * FROM users`);
		expect(users?.length).toBeGreaterThan(0);
	});

	afterAll(async () => {
		await tempDb?.close();
		//creamos una db temporal
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}
	});
});
