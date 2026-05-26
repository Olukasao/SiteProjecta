const express = require("express");
const { login } = require("../controllers/authController");
const {
    criarImovel,
    getImoveis,
    getImovelById,
    deletarImovel,
    atualizarImovel
} = require("../controllers/propertyController");

const { getUsers, getUserById, updateUser, createUser, resetUserPassword, deleteUser } = require("../controllers/usersController");
const { getAuditLogs } = require("../controllers/auditController");

const { authMiddleware, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = require("../upload");


router.post("/login", login);
router.get("/me", authMiddleware, (req, res) => {
    res.json(req.user);
});
router.get("/", (req, res) => {
    res.json({ message: "API rodando 🚀" });
});

// endpoints imoveis
router.get("/imoveis", getImoveis);
router.get("/imovel/:id", getImovelById);

router.post("/imoveis", authMiddleware, upload.array("imagens"), criarImovel);
router.put("/imoveis/:id", authMiddleware, upload.array("imagens"), atualizarImovel);

router.delete("/imoveis/:id", authMiddleware, deletarImovel);


// endpoints usuarios
router.get("/usuarios/", authMiddleware, getUsers)
router.get("/usuario/:id", authMiddleware, getUserById)
router.post("/usuarios/add", authMiddleware, createUser);
router.put("/usuario/update/:id", authMiddleware, updateUser)
router.put("/usuario/reset-password/:id", authMiddleware, resetUserPassword)
router.delete("/usuarios/:id", authMiddleware, requireAdmin, deleteUser)

// auditoria
router.get("/auditoria", authMiddleware, requireAdmin, getAuditLogs);



module.exports = router;
