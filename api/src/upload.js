const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔥 cria pasta automaticamente se não existir
const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const nome = Date.now() + path.extname(file.originalname);
    cb(null, nome);
  }
});

const upload = multer({ storage });

module.exports = upload;