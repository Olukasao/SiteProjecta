const db = require("../database/db");
const bcrypt = require("bcrypt");
const { logAudit } = require("./auditController");

const USER_SELECT_FIELDS = `
    id,
    nome,
    email,
    username,
    role,
    phone,
    status,
    created_at,
    updated_at,
    last_login
`;

const getUsers = (req, res) => {
    const query = `SELECT ${USER_SELECT_FIELDS} FROM admins`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        return res.status(200).json(results);
    });
};

const getUserById = (req, res) => {
    const { id } = req.params;

    const query = `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(results[0]);
    });
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            email,
            username,
            role,
            status,
            phone
        } = req.body;

        // validação básica
        if (!nome || !email || !username) {
            return res.status(400).json({
                message: "Nome, email e username são obrigatórios"
            });
        }

        const query = `
            UPDATE admins
            SET 
                nome = ?,
                email = ?,
                username = ?,
                role = ?,
                status = ?,
                phone = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const values = [
            nome,
            email,
            username,
            role || "editor",
            status || "active",
            phone || null,
            id
        ];

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        return res.status(200).json({
            message: "Usuário atualizado com sucesso"
        });

    } catch (error) {
        console.error("UPDATE USER ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            nome,
            email,
            username,
            senha,
            role,
            phone
        } = req.body;

        // 🔥 validação básica
        if (!nome || !email || !username || !senha) {
            return res.status(400).json({
                message: "Nome, email, username e senha são obrigatórios"
            });
        }

        // 🔥 verifica duplicidade
        const [existing] = await db.promise().query(
            "SELECT id FROM admins WHERE email = ? OR username = ?",
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email ou username já cadastrado"
            });
        }

        // 🔐 hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        const query = `
            INSERT INTO admins 
            (nome, email, username, senha, role, phone, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        const values = [
            nome,
            email,
            username,
            hashedPassword,
            role || "editor",
            phone || null,
            "active"
        ];

        const [result] = await db.promise().query(query, values);

        return res.status(201).json({
            message: "Usuário criado com sucesso",
            userId: result.insertId
        });

    } catch (error) {
        console.error("CREATE USER ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { senha } = req.body;

        if (!senha) {
            return res.status(400).json({
                message: "Senha é obrigatória"
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                message: "A senha deve ter no mínimo 8 caracteres"
            });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.promise().query(
            `
                UPDATE admins
                SET senha = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
            [hashedPassword, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        return res.status(200).json({
            message: "Senha redefinida com sucesso"
        });

    } catch (error) {
        console.error("RESET USER PASSWORD ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === Number(req.user?.id)) {
            return res.status(400).json({
                message: "Você não pode excluir o próprio usuário"
            });
        }

        const [users] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const user = users[0];
        const [result] = await db.promise().query(
            "DELETE FROM admins WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        await logAudit(req, {
            action: "delete",
            resourceType: "usuario",
            resourceId: Number(id),
            resourceTitle: user.nome,
            details: {
                before: user
            }
        });

        return res.status(200).json({
            message: "Usuário excluído com sucesso"
        });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};



module.exports = {
    getUserById,
    getUsers,
    updateUser,
    createUser,
    resetUserPassword,
    deleteUser
};
