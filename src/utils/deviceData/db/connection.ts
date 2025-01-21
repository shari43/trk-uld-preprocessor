import sql, { ConnectionPool, config } from "mssql";

const dbConfig: config = {
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    server: process.env.DB_SERVER || "",
    database: process.env.DB_NAME || "",
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    pool: {
        max: 25,
        min: 0,
        idleTimeoutMillis: 30000,
    },
  };

let pool: ConnectionPool | null = null;
export const initializePool = async (): Promise<void> => {
    if (pool) {
        return;
    }
  
    try {
        pool = await sql.connect(dbConfig);
        console.log("Database connection pool initialized successfully.");
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error initializing database pool:", error.message);
        } else {
            console.error("An unexpected error occurred:", error);
        }
        throw error;
    }
};

export const getPool = (): ConnectionPool => {
    if (!pool) {
        throw new Error("Database pool is not initialized. Call initializePool() first.");
    }
    return pool;
};