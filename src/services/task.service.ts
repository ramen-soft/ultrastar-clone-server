import { Task, TaskIDValue } from "../models/Task";
import { v4 as uuid } from "uuid";
import torrentService from "./torrent.service";

class TaskService {
	private tasks: Map<TaskIDValue, Task>;

	constructor() {
		this.tasks = new Map<TaskIDValue, Task>();
	}

	getTaskById(id: TaskIDValue): Task | null {
		return this.tasks.has(id) ? this.tasks.get(id) ?? null : null;
	}

	getTasks(): [TaskIDValue, Task][] {
		return [...this.tasks.entries()];
	}

	getTasksByTorrentId(torrentId: string): Map<TaskIDValue, Task> {
		return new Map<TaskIDValue, Task>(
			Array.from(this.tasks.entries()).filter(
				([_, task]) => task.torrentId === torrentId
			)
		);
	}

	async createTask(task: Task) {
		this.tasks.set(uuid(), task);
		return await torrentService.addTask(task);
	}
}

export default new TaskService();
