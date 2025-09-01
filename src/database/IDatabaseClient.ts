export interface IDatabaseClient {
	/**
	 * Ejecuta una consulta que devuelve un registro único
	 *
	 * @template T
	 * @returns {Promise<T | null>}
	 * @memberof IDatabaseClient
	 * @param query
	 * @param params
	 */
	findOne<T = any>(query: string, params?: any[]): Promise<T | null>;

	/**
	 * Ejecuta una consulta que no necesariamente devuelve registros.
	 * @returns {Promise<any>}
	 * @memberof IDatabaseClient
	 * @param query
	 * @param params
	 */
	execute(query: string, params?: any[]): Promise<any>;
}
