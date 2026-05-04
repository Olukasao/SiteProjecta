const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "projecta",
  password: "project@123",
  database: "projecta"
});

/*const connection = mysql.createConnection({
  host: "srv792.hstgr.io",
  user: "u654914095_root",
  password: "Project#123@",
  database: "u654914095_projectaempre"
});
*/


connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  } else {
    console.log("Banco conectado");
  }
});

module.exports = connection;