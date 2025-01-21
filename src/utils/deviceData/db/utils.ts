import { getPool } from "./connection";

interface QueryResult {
    recordset?: any[];
    rowsAffected?: number[];
}
  
export const executeQuery = async (query: string, params: any[] = []): Promise<QueryResult> => {

    const pool = getPool(); // Use the initialized pool

    try {
        const request = pool.request();
        params.forEach(({ name, type, value }) => {
            request.input(`${name}`, type, value);
        });

        const result = await request.query(query);
        return { recordset: result.recordset, rowsAffected: result.rowsAffected };
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
};
  
export const executeUpdate = async (query: string, params: any[] = []): Promise<number> => {
    const result = await executeQuery(query, params);
    return result.rowsAffected ? result.rowsAffected[0] : 0;
};