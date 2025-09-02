import { getDatabaseClient } from "../database/DatabaseClientProvider";
import { SQLiteClient } from "../database/sqlite/SQLiteClient";
import { IBaseRepository } from "./IBaseRepository";
import bcrypt from "bcrypt";

class UserRepository implements IBaseRepository<User, "id"> {
	constructor(private db: SQLiteClient) {}

	async create(user: Omit<User, "id"> & { password: string }): Promise<void> {
		const hashedPassword = await bcrypt.hash(user.password, 10);

		this.db.execute(
			`INSERT INTO users (username, password) VALUES (?, ?)`,
			[user.username, hashedPassword]
		);
		return;
	}

	async findById(id: User["id"]): Promise<User | null> {
		const data = await this.db.findOne(
			`SELECT id, username FROM users WHERE id = ?`,
			[id]
		);
		if (data) {
			const u: User = {
				id: data["id"],
				username: data["username"],
			};
			return u;
		}
		return null;
	}

	async findAll(): Promise<User[]> {
		const data = await this.db.find(`SELECT * FROM users`);
		return data.map((row) => {
			const u: User = {
				id: row["id"],
				username: row["username"],
				first_name: row["first_name"],
				last_name: row["last_name"],
			};
			return u;
		});
	}

	async update(user: User) {
		this.db.execute(`UPDATE users SET username = ? WHERE id = ?`, [
			user.username,
			user.id,
		]);
		return user;
	}

	async delete(user: User) {
		this.db.execute(`DELETE FROM users WHERE id = ?`, [user.id]);
	}

	async checkRefreshToken(
		userId: User["id"],
		refreshToken: string
	): Promise<boolean> {
		const query = "SELECT * FROM users WHERE id = ? AND refresh_token = ?";
		const user = await this.db.findOne(query, [userId, refreshToken]);
		return !!user;
	}

	async updateRefreshToken(
		userId: User["id"],
		refreshToken: string
	): Promise<void> {
		return this.db.execute(
			"UPDATE users SET refresh_token = ? WHERE id = ?",
			[refreshToken, userId]
		);
	}
}

let userRepository: UserRepository | null = null;

export async function getUserRepository(): Promise<UserRepository> {
	if (!userRepository) {
		const dbClient = await getDatabaseClient();
		userRepository = new UserRepository(dbClient as SQLiteClient);
	}
	return userRepository;
}
