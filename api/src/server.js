const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/routes");
const { ensureAuditTable } = require("./controllers/auditController");
require("dotenv").config();

const porta = process.env.PORT || 3500;
const app = express();

console.log(process.env.BASE_URL)
ensureAuditTable().catch((err) => {
  console.error("Erro ao preparar auditoria:", err);
});

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../../public_html/uploads"))
);

// 🔥 rotas api
app.use("/api", routes);

app.listen(porta, () => {
  console.log("Servidor rodando na porta " + porta);
});
