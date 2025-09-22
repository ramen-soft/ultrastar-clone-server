import { User } from "./User";
export type TaskIDValue = string;

export interface Task {
	id: string;
	userId: User["id"];
	torrentId: string;
}
