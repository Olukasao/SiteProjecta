const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes");

const porta = 3500
const app = express();
const upload = require("./upload");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api",routes);


app.listen(porta, () => {
  console.log("Servidor rodando na porta " + porta );
});