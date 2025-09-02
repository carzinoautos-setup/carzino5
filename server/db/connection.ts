import mysql from "mysql2/promise";

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
}

// Create connection pool for better performance
let pool: mysql.Pool | null = null;

export function createDatabaseConnection(): mysql.Pool {
  if (pool) {
    return pool;
  }

  const config: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wordpress",
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  };

  try {
    pool = mysql.createPool(config);
    console.log("✅ Database connection pool created successfully");
    return pool;
  } catch (error) {
    console.error("❌ Failed to create database connection pool:", error);
    throw error;
  }
}

// Get database connection
export function getDatabase(): mysql.Pool {
  if (!pool) {
    return createDatabaseConnection();
  }
  return pool;
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    const [rows] = await db.execute("SELECT 1 as test");
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}

// Close database connection (for cleanup)
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("✅ Database connection pool closed");
  }
}
