/**
 * @template T Modelo del repositorio
 * @template K Propiedad que se usa como identificador
 */

export interface IBaseRepository<T, K extends keyof T> {
	findById(id: T[K]): Promise<T | null>;
	findAll(): Promise<T[]>;
	create(entity: unknown): Promise<void>;
	update(entity: T): Promise<T>;
	delete(entity: T): Promise<void>;
}
