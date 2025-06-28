import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

let pool;

export default function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });
    console.log("✅ Pool created");
  }
  return pool;
}
