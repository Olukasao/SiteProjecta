const db = require("../database/db");
const bcrypt = require("bcrypt");
const { logAudit } = require("./auditController");
const { getPasswordValidationMessage } = require("../utils/security");

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
    last_login,
    deleted_at
`;

const ADMIN_TARGET_MESSAGE = "Somente dev pode alterar contas de administradores ou devs";
const ALLOWED_ROLES = ["editor", "admin", "dev"];
let userTrashColumnReady = null;

const ensureUserTrashColumn = async () => {
    if (!userTrashColumnReady) {
        userTrashColumnReady = (async () => {
            const [columns] = await db.promise().query("SHOW COLUMNS FROM admins LIKE 'deleted_at'");

            if (columns.length === 0) {
                await db.promise().query("ALTER TABLE admins ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
            }
        })().catch((error) => {
            userTrashColumnReady = null;
            throw error;
        });
    }

    await userTrashColumnReady;
};

function isDevUser(user) {
    return user?.role === "dev";
}

function isProtectedUser(user) {
    return ["admin", "dev"].includes(user?.role);
}

function normalizeRole(role, fallback = "editor") {
    return ALLOWED_ROLES.includes(role) ? role : fallback;
}

function sanitizeUserForAudit(user) {
    return {
        id: user.id,
        nome: user.nome,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || null,
        status: user.status,
        created_at: user.created_at || null,
        updated_at: user.updated_at || null,
        last_login: user.last_login || null,
        deleted_at: user.deleted_at || null
    };
}

function normalizeAuditValue(value) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function buildUserChanges(before, after) {
    if (!before || !after) return [];

    return ["nome", "email", "username", "role", "phone", "status"]
        .filter((field) => normalizeAuditValue(before[field]) !== normalizeAuditValue(after[field]))
        .map((field) => ({
            campo: field,
            antes: before[field],
            depois: after[field]
        }));
}

const getUsers = async (req, res) => {
    try {
        await ensureUserTrashColumn();
        const [results] = await db.promise().query(
            `
                SELECT ${USER_SELECT_FIELDS}
                FROM admins
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC, id DESC
            `
        );

        return res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        await ensureUserTrashColumn();
        const { id } = req.params;

        const [results] = await db.promise().query(
            `
                SELECT ${USER_SELECT_FIELDS}
                FROM admins
                WHERE id = ? AND deleted_at IS NULL
            `,
            [id]
        );

        if (!results.length) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        return res.status(200).json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        await ensureUserTrashColumn();
        const { id } = req.params;
        const {
            nome,
            email,
            username,
            role,
            status,
            phone,
            telefone
        } = req.body;

        if (!nome || !email || !username) {
            return res.status(400).json({
                message: "Nome, email e username são obrigatórios"
            });
        }

        const [users] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const user = users[0];
        const before = sanitizeUserForAudit(user);

        if (!isDevUser(req.user) && isProtectedUser(user)) {
            return res.status(403).json({
                message: ADMIN_TARGET_MESSAGE
            });
        }

        const nextRole = isDevUser(req.user) ? normalizeRole(role, user.role) : "editor";

        const [result] = await db.promise().query(
            `
                UPDATE admins
                SET
                    nome = ?,
                    email = ?,
                    username = ?,
                    role = ?,
                    status = ?,
                    phone = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            `,
            [
                nome,
                email,
                username,
                nextRole,
                status || "active",
                phone || telefone || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const [updatedUsers] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        const after = sanitizeUserForAudit(updatedUsers[0]);

        await logAudit(req, {
            action: "update",
            resourceType: "usuario",
            resourceId: Number(id),
            resourceTitle: after.nome,
            details: {
                changes: buildUserChanges(before, after),
                before,
                after
            }
        });

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
        await ensureUserTrashColumn();
        const {
            nome,
            email,
            username,
            senha,
            role,
            phone,
            telefone
        } = req.body;

        if (!nome || !email || !username || !senha) {
            return res.status(400).json({
                message: "Nome, email, username e senha são obrigatórios"
            });
        }

        const passwordError = getPasswordValidationMessage(senha);
        if (passwordError) {
            return res.status(400).json({
                message: passwordError
            });
        }

        const [existing] = await db.promise().query(
            "SELECT id FROM admins WHERE deleted_at IS NULL AND (email = ? OR username = ?)",
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email ou username já cadastrado"
            });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const newUserRole = isDevUser(req.user) ? normalizeRole(role) : "editor";

        const [result] = await db.promise().query(
            `
                INSERT INTO admins
                (nome, email, username, senha, role, phone, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `,
            [
                nome,
                email,
                username,
                hashedPassword,
                newUserRole,
                phone || telefone || null,
                "active"
            ]
        );

        const [createdUsers] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ?`,
            [result.insertId]
        );
        const createdUser = sanitizeUserForAudit(createdUsers[0]);

        await logAudit(req, {
            action: "create",
            resourceType: "usuario",
            resourceId: result.insertId,
            resourceTitle: createdUser.nome,
            details: {
                after: createdUser
            }
        });

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
        await ensureUserTrashColumn();
        const { id } = req.params;
        const { senha } = req.body;

        if (Number(id) === Number(req.user?.id)) {
            return res.status(400).json({
                message: "Use a tela Minha senha para alterar sua própria senha"
            });
        }

        if (!senha) {
            return res.status(400).json({
                message: "Senha é obrigatória"
            });
        }

        const passwordError = getPasswordValidationMessage(senha);
        if (passwordError) {
            return res.status(400).json({
                message: passwordError
            });
        }

        const [users] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const user = users[0];

        if (!isDevUser(req.user) && user.role === "dev") {
            return res.status(403).json({
                message: "Somente dev pode redefinir senha de usuários dev"
            });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const [result] = await db.promise().query(
            `
                UPDATE admins
                SET senha = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            `,
            [hashedPassword, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        await logAudit(req, {
            action: "update",
            resourceType: "usuario",
            resourceId: Number(id),
            resourceTitle: user.nome,
            details: {
                changes: [
                    {
                        campo: "senha",
                        antes: "[protegido]",
                        depois: "[redefinida]"
                    }
                ],
                before: sanitizeUserForAudit(user)
            }
        });

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

const changeOwnPassword = async (req, res) => {
    try {
        await ensureUserTrashColumn();
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                message: "Senha atual e nova senha são obrigatórias"
            });
        }

        const passwordError = getPasswordValidationMessage(novaSenha);
        if (passwordError) {
            return res.status(400).json({
                message: passwordError.replace("A senha", "A nova senha")
            });
        }

        if (senhaAtual === novaSenha) {
            return res.status(400).json({
                message: "A nova senha deve ser diferente da senha atual"
            });
        }

        const [users] = await db.promise().query(
            `
                SELECT id, nome, username, email, senha, role, status
                FROM admins
                WHERE id = ? AND deleted_at IS NULL
                LIMIT 1
            `,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const user = users[0];
        const senhaValida = await bcrypt.compare(senhaAtual, user.senha);

        if (!senhaValida) {
            return res.status(400).json({
                message: "Senha atual inválida"
            });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        await db.promise().query(
            `
                UPDATE admins
                SET senha = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            `,
            [hashedPassword, req.user.id]
        );

        await logAudit(req, {
            action: "update",
            resourceType: "usuario",
            resourceId: Number(req.user.id),
            resourceTitle: user.nome,
            details: {
                changes: [
                    {
                        campo: "senha",
                        antes: "[protegido]",
                        depois: "[alterada pelo proprio usuario]"
                    }
                ],
                self_service: true
            }
        });

        return res.status(200).json({
            message: "Senha alterada com sucesso"
        });

    } catch (error) {
        console.error("CHANGE OWN PASSWORD ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await ensureUserTrashColumn();
        const { id } = req.params;

        if (!isDevUser(req.user)) {
            return res.status(403).json({
                message: "Somente um dev pode excluir usuários. Entre em contato com um dev para realizar essa exclusão."
            });
        }

        if (Number(id) === Number(req.user?.id)) {
            return res.status(400).json({
                message: "Você não pode excluir o próprio usuário"
            });
        }

        const [users] = await db.promise().query(
            `SELECT ${USER_SELECT_FIELDS} FROM admins WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado"
            });
        }

        const user = users[0];

        const deletedStamp = `${id}_${Date.now()}`;
        const [result] = await db.promise().query(
            `
                UPDATE admins
                SET
                    status = 'inactive',
                    email = ?,
                    username = ?,
                    deleted_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            `,
            [
                `deleted_${deletedStamp}@deleted.local`,
                `deleted_${deletedStamp}`,
                id
            ]
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
                before: sanitizeUserForAudit(user)
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
    ensureUserTrashColumn,
    getUserById,
    getUsers,
    updateUser,
    createUser,
    resetUserPassword,
    changeOwnPassword,
    deleteUser
};
