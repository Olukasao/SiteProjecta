const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true, quiet: true });

const routes = require("./routes/routes");
const { ensureAuditTable } = require("./controllers/auditController");
const { ensurePropertyTrashColumn, ensureImageTable } = require("./controllers/propertyController");
const { ensureUserTrashColumn } = require("./controllers/usersController");
const { apiRateLimiter } = require("./middlewares/rateLimit");
const { getApiStatus } = require("./utils/health");

const porta = process.env.PORT || 8600;
const app = express();
const publicHtmlCandidates = [
  path.resolve(__dirname, "../public_html"),
  path.resolve(__dirname, "../../public_html")
];
const publicHtmlDir =
  publicHtmlCandidates.find((dir) => fs.existsSync(path.join(dir, "index.html"))) ||
  publicHtmlCandidates[0];
const publicIndexFile = path.join(publicHtmlDir, "index.html");
// Diretórios candidatos para servir arquivos enviados. Pode ser sobrescrito pela variável
// de ambiente UPLOADS_DIR (recomendada em produção/Hostinger).
const candidateUploadDirs = [
  path.resolve(__dirname, "../../public_html/uploads"),
  path.resolve(__dirname, "../public_html/uploads"),
  path.resolve(__dirname, "../../public/uploads"),
  path.resolve(__dirname, "../public/uploads")
];

const uploadDirs = [];
if (process.env.UPLOADS_DIR) {
  uploadDirs.push(path.resolve(String(process.env.UPLOADS_DIR)));
}
candidateUploadDirs.forEach((d) => uploadDirs.push(d));

// Log para diagnóstico sobre quais diretórios serão expostos em /uploads
console.log("[server] uploadDirs:", uploadDirs);

app.disable("x-powered-by");
app.set("trust proxy", 1);

ensureAuditTable().catch((err) => {
  console.error("Erro ao preparar auditoria:", err);
});
ensurePropertyTrashColumn().catch((err) => {
  console.error("Erro ao preparar lixeira:", err);
});
ensureImageTable().catch((err) => {
  console.error("Erro ao preparar tabela de imagens:", err);
});
ensureUserTrashColumn().catch((err) => {
  console.error("Erro ao preparar lixeira de usuarios:", err);
});

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://projectaempreendimentos.com.br",
  ...String(process.env.CORS_ORIGINS || "").split(",")
]
  .map((origin) => String(origin || "").trim())
  .filter(Boolean)
  .filter((origin, index, origins) => origins.indexOf(origin) === index);

const allowedOriginSet = new Set(allowedOrigins);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOriginSet.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem nao permitida pelo CORS"));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json(getApiStatus());
});

// 🔥 rotas api
app.use("/api", apiRateLimiter);
app.use("/api", routes);

uploadDirs.forEach((dir) => {
  app.use("/uploads", express.static(dir));
});

app.use(express.static(publicHtmlDir));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(publicIndexFile, (err) => {
      if (err) next();
    });
  }

  return next();
});

app.use((err, req, res, _next) => {
  if (err.message === "Origem nao permitida pelo CORS") {
    return res.status(403).json({ error: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Imagem acima do limite de 5MB" });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ error: "Limite de 20 imagens por envio" });
  }

  if (err.message === "Apenas imagens JPG, PNG, WEBP ou AVIF sao permitidas") {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(porta, () => {
  console.log("Servidor rodando na porta " + porta);
});
