export interface IBaseRepository<T, K extends keyof T> {
	findById(id: T[K]): Promise<T | null>;
	findAll(): Promise<T[]>;
	create(entity: T): Promise<void>;
	update(entity: T): Promise<T>;
	delete(entity: T): Promise<void>;
}
