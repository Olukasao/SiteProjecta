const db = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 LOGIN
const login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  db.query(
    "SELECT id, nome, username, email, senha, role, status FROM admins WHERE email = ? LIMIT 1",
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const user = results[0];

      if (user.status && user.status !== "active") {
        return res.status(403).json({ error: "Usuário sem acesso" });
      }

      try {
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
          return res.status(401).json({ error: "Senha inválida" });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET || "segredo",
          { expiresIn: "1d" }
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
