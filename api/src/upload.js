const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadPath = path.resolve(
  __dirname,
  "../../public_html/uploads"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas imagens são permitidas"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;