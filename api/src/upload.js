const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const uploadsRoot = process.env.UPLOADS_DIR
  ? path.resolve(String(process.env.UPLOADS_DIR))
  : path.resolve(__dirname, "../public_html/uploads");

const uploadPath = path.basename(uploadsRoot).toLowerCase() === "imoveis"
  ? uploadsRoot
  : path.join(uploadsRoot, "imoveis");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

console.log("[upload] usando uploadPath:", uploadPath);
console.log("[upload] usando uploadsRoot:", uploadsRoot);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = path.basename(file.originalname, ext)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "imagem";

    const safeName = `imovel-${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${originalName}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
      return cb(new Error("Apenas imagens JPG, PNG, WEBP ou AVIF sao permitidas"));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 20
  }
});

module.exports = upload;
module.exports.uploadPath = uploadPath;
module.exports.uploadsRoot = uploadsRoot;
module.exports.uploadUrlPrefix = "/uploads/imoveis";
