const db = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../utils/security");

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map();

function getLoginKey(req, email) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `${ip}:${String(email || "").toLowerCase().trim()}`;
}

function isLoginBlocked(key) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;

  if (Date.now() > attempt.expiresAt) {
    loginAttempts.delete(key);
    return false;
  }

  return attempt.count >= MAX_LOGIN_ATTEMPTS;
}

function registerLoginFailure(key) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || now > attempt.expiresAt) {
    loginAttempts.set(key, {
      count: 1,
      expiresAt: now + LOGIN_WINDOW_MS
    });
    return;
  }

  attempt.count += 1;
  attempt.expiresAt = now + LOGIN_WINDOW_MS;
}

function clearLoginFailures(key) {
  loginAttempts.delete(key);
}

// 🔑 LOGIN
const login = (req, res) => {
  const { email, senha } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const loginKey = getLoginKey(req, normalizedEmail);

  if (!normalizedEmail || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  if (isLoginBlocked(loginKey)) {
    return res.status(429).json({
      error: "Muitas tentativas de login. Tente novamente em alguns minutos"
    });
  }

  db.query(
    "SELECT id, nome, username, email, senha, role, status FROM admins WHERE email = ? LIMIT 1",
    [normalizedEmail],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (results.length === 0) {
        registerLoginFailure(loginKey);
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const user = results[0];

      if (user.status && user.status !== "active") {
        return res.status(403).json({ error: "Usuário sem acesso" });
      }

      try {
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
          registerLoginFailure(loginKey);
          return res.status(401).json({ error: "Email ou senha inválidos" });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          getJwtSecret(),
          { expiresIn: "1d" }
        );

        clearLoginFailures(loginKey);

        db.query(
          "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
          [user.id],
          (updateErr) => {
            if (updateErr) {
              console.error("Erro ao atualizar last_login:", updateErr);
            }
          }
        );

        return res.json({
          message: "Login realizado com sucesso",
          token,
          user: {
            id: user.id,
            nome: user.nome,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });

      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao validar senha" });
      }
    }
  );
};

module.exports = { login };
