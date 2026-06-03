const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { getJwtSecret } = require("../utils/security");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Sem token" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded?.id) {
      return res.status(401).json({ error: "Token inválido" });
    }

    db.query(
      `
        SELECT id, nome, username, email, role, status
        FROM admins
        WHERE id = ?
        LIMIT 1
      `,
      [decoded.id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao validar usuário" });
        }

        if (!results.length) {
          return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const user = results[0];

        if (user.status && user.status !== "active") {
          return res.status(403).json({ error: "Usuário sem acesso" });
        }

        req.user = user;
        next();
      }
    );
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!["admin", "dev"].includes(req.user?.role)) {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }

  return next();
};

module.exports = { authMiddleware, requireAdmin };
