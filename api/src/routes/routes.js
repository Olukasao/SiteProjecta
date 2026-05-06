const express = require("express");
const { login } = require("../controllers/authController");
const {
    criarImovel,
    getImoveis,
    getImovelById,
    deletarImovel,
    atualizarImovel
} = require("../controllers/propertyController");

const { getUsers, getUserById, updateUser, createUser } = require("../controllers/usersController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
const upload = require("../upload");


router.post("/login", login);
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



module.exports = router;