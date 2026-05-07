const mysql = require("mysql2");

/*const connection = mysql.createConnection({
  host: "localhost",
  user: "projecta",
  password: "project@123",
  database: "projecta"
});*/

const pool = mysql.createPool({
  host: "localhost",
  user: "projecta",
  password: "project@123",
  database: "projecta",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/*const pool = mysql.createPool({
  host: "srv792.hstgr.io",
  user: "u654914095_projecta",
  password: "g32&vW1|6J/",
  database: "u654914095_projecta",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});*/

pool.getConnection((err, conn) => {
  if (err) {
    console.error("Erro ao conectar:", err);
    return;
  }

  console.log("Banco conectado");

  conn.release(); // 🔥 MUITO IMPORTANTE
});

module.exports = pool;