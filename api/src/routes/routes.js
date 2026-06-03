const express = require("express");
const { login } = require("../controllers/authController");
const {
    criarImovel,
    getImoveis,
    getImovelById,
    deletarImovel,
    getDeletedImoveis,
    restaurarImovel,
    atualizarImovel,
    deleteImovelImagem
} = require("../controllers/propertyController");

const {
    getUsers,
    getUserById,
    updateUser,
    createUser,
    resetUserPassword,
    changeOwnPassword,
    deleteUser
} = require("../controllers/usersController");
const { getAuditLogs } = require("../controllers/auditController");

const { authMiddleware, requireAdmin } = require("../middlewares/authMiddleware");
const { getApiStatus } = require("../utils/health");

const router = express.Router();
const upload = require("../upload");

router.post("/login", login);
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});
router.put("/me/password", authMiddleware, changeOwnPassword);
router.get("/", (req, res) => {
    res.json(getApiStatus());
});
router.get("/health", (req, res) => {
    res.json(getApiStatus());
});

// endpoints imoveis
router.get("/imoveis", getImoveis);
router.get("/imoveis/lixeira", authMiddleware, requireAdmin, getDeletedImoveis);
router.get("/imovel/:id", getImovelById);

router.post("/imoveis", authMiddleware, upload.array("imagens", 20), criarImovel);
router.put("/imoveis/:id", authMiddleware, upload.array("imagens", 20), atualizarImovel);
router.delete("/imoveis/:id/imagens/:imageId", authMiddleware, requireAdmin, deleteImovelImagem);
router.put("/imoveis/:id/restaurar", authMiddleware, requireAdmin, restaurarImovel);

router.delete("/imoveis/:id", authMiddleware, requireAdmin, deletarImovel);


// endpoints usuarios
router.get("/usuarios/", authMiddleware, requireAdmin, getUsers)
router.get("/usuario/:id", authMiddleware, requireAdmin, getUserById)
router.post("/usuarios/add", authMiddleware, requireAdmin, createUser);
router.put("/usuario/update/:id", authMiddleware, requireAdmin, updateUser)
router.put("/usuario/reset-password/:id", authMiddleware, requireAdmin, resetUserPassword)
router.delete("/usuarios/:id", authMiddleware, requireAdmin, deleteUser)

// auditoria
router.get("/auditoria", authMiddleware, requireAdmin, getAuditLogs);



module.exports = router;
