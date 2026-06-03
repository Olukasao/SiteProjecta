const path = require("path");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });
dotenv.config({ path: path.resolve(__dirname, "../../.env.local"), override: true, quiet: true });

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Variaveis de banco ausentes: ${missingEnv.join(", ")}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar:", err);
    return;
  }

  console.log("Banco conectado");
  conn.release();
});

module.exports = pool;
