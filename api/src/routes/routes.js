    const express = require("express");
    const { login } = require("../controllers/authController");
    const {
        criarImovel,
        getImoveis,
        getImovelById,
        deletarImovel,
        atualizarImovel
    } = require("../controllers/propertyController");


    const { authMiddleware } = require("../middlewares/authMiddleware");

    const router = express.Router();
    const upload = require("../upload");


    router.post("/login", login);
    router.get("/",()=>{
        console.error("Api rodando");
    })
    router.get("/imoveis", getImoveis);
    router.get("/imovel/:id", getImovelById);

    router.post("/imoveis", authMiddleware, upload.array("imagens"), criarImovel);
    router.put("/imoveis/:id", authMiddleware, atualizarImovel);

    router.delete("/imoveis/:id", authMiddleware, deletarImovel);

    module.exports = router;