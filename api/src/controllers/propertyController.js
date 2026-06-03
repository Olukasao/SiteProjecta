const fs = require("fs");
const path = require("path");
const db = require("../database/db");
const upload = require("../upload");
const { logAudit } = require("./auditController");

let propertyTrashColumnReady = null;
let imageTableReady = null;
let publicImoveisCache = null;
const PUBLIC_IMOVEIS_CACHE_MS = Number(process.env.PUBLIC_IMOVEIS_CACHE_MS) || 30 * 1000;

const ensurePropertyTrashColumn = async () => {
  if (!propertyTrashColumnReady) {
    propertyTrashColumnReady = (async () => {
      const [columns] = await db.promise().query("SHOW COLUMNS FROM imoveis LIKE 'deleted_at'");

      if (columns.length === 0) {
        await db.promise().query("ALTER TABLE imoveis ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
      }
    })().catch((error) => {
      propertyTrashColumnReady = null;
      throw error;
    });
  }

  await propertyTrashColumnReady;
};

const clearPublicImoveisCache = () => {
  publicImoveisCache = null;
};

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getPublicBaseUrl = (req) => {
  const requestBaseUrl = req ? `${req.protocol}://${req.get("host")}` : "";
  return String(process.env.BASE_URL || requestBaseUrl).replace(/\/+$/, "");
};

const normalizeImagePathForStorage = (value) => {
  if (!value) return "";

  let imageUrl = String(value).trim();
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const parsedUrl = new URL(imageUrl);
      imageUrl = parsedUrl.pathname + parsedUrl.search;
    } catch {
      return "";
    }
  }

  if (imageUrl.startsWith("uploads/")) {
    imageUrl = `/${imageUrl}`;
  }

  if (!imageUrl.startsWith("/uploads/imoveis/")) {
    return "";
  }

  const sanitizedPath = imageUrl.split("?")[0].split("#")[0];
  return sanitizedPath;
};

const normalizeImageUrl = (value, req) => {
  if (typeof value !== "string") return "";

  const imageUrl = value.trim();
  if (!imageUrl) return "";

  const baseUrl = getPublicBaseUrl(req);
  if (!baseUrl) return imageUrl;

  if (imageUrl.startsWith("/uploads/")) {
    return `${baseUrl}${imageUrl}`;
  }

  if (imageUrl.startsWith("uploads/")) {
    return `${baseUrl}/${imageUrl}`;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    if (parsedUrl.pathname.startsWith("/uploads/")) {
      return `${baseUrl}${parsedUrl.pathname}${parsedUrl.search}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
};

const splitImageUrls = (value, req) => {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((url) => normalizeImageUrl(url, req))
    .filter(Boolean);
};

const ensureImageTable = async () => {
  if (!imageTableReady) {
    imageTableReady = db.promise().query(`
      CREATE TABLE IF NOT EXISTS imovel_imagens (
        id INT NOT NULL AUTO_INCREMENT,
        imovel_id INT NOT NULL,
        url VARCHAR(255) NOT NULL,
        principal TINYINT(1) DEFAULT 0,
        ordem INT(11) DEFAULT 0,
        PRIMARY KEY (id),
        KEY imovel_id (imovel_id),
        CONSTRAINT imovel_imagens_ibfk_1 FOREIGN KEY (imovel_id) REFERENCES imoveis (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).catch((error) => {
      imageTableReady = null;
      throw error;
    });
  }

  await imageTableReady;
};

const deleteImageFile = async (imageUrl) => {
  const relativePath = normalizeImagePathForStorage(imageUrl);
  if (!relativePath) return;

  const filename = path.basename(relativePath);
  const filePath = path.join(upload.uploadPath || path.resolve(__dirname, "../public/uploads/imoveis"), filename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error("Erro ao remover arquivo de imagem:", err, filePath);
  }
};

const getImovelSnapshot = async (id) => {
  const [results] = await db.promise().query(
    `
      SELECT
        i.*,
        d.quartos,
        d.suites,
        d.banheiros,
        d.vagas,
        d.area,
        GROUP_CONCAT(img.url ORDER BY img.id SEPARATOR ',') AS imagens
      FROM imoveis i
      LEFT JOIN imovel_detalhes d ON d.imovel_id = i.id
      LEFT JOIN imovel_imagens img ON img.imovel_id = i.id
      WHERE i.id = ?
      GROUP BY i.id
    `,
    [id]
  );

  if (!results.length) return null;

  const imovel = results[0];

  return {
    ...imovel,
    imagens: imovel.imagens ? imovel.imagens.split(",") : [],
    diferenciais: parseJsonField(imovel.diferenciais, [])
  };
};

const normalizeAuditValue = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const buildImovelChanges = (before, after) => {
  if (!before || !after) return [];

  const fields = [
    "titulo",
    "descricao",
    "preco",
    "tipo",
    "status",
    "cidade",
    "bairro",
    "endereco",
    "cep",
    "preco_condominio",
    "preco_iptu",
    "quartos",
    "suites",
    "banheiros",
    "vagas",
    "area",
    "diferenciais",
    "imagens"
  ];

  return fields
    .filter((field) => normalizeAuditValue(before[field]) !== normalizeAuditValue(after[field]))
    .map((field) => ({
      campo: field,
      antes: before[field],
      depois: after[field]
    }));
};

const criarImovel = async (req, res) => {
  let connection;

  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      nome,
      descricao,
      status,
      tipo
    } = req.body;

    const preco = Number(req.body.preco) || 0;
    const precoCondominio = Number(req.body.precoCondominio) || 0;
    const precoIptu = Number(req.body.precoIptu) || 0;

    // =========================
    // 🔥 SAFE PARSE
    // =========================
    const safeParse = (data) => {
      if (!data) return {};
      if (typeof data === "object") return data;
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    };

    const endereco = safeParse(req.body.endereco);
    const detalhes = safeParse(req.body.detalhes);

    let diferenciais = [];
    try {
      diferenciais = req.body.diferenciais
        ? JSON.parse(req.body.diferenciais)
        : [];
    } catch {
      diferenciais = [];
    }

    // =========================
    // 🔥 IMAGENS
    // =========================
    

    const imagens = req.files?.map((file) =>
      `/uploads/imoveis/${file.filename}`
    ) || [];

    // =========================
    // 🔥 SLUG
    // =========================
    const nomeSafe = (nome || "").trim() || "sem-nome";

    const slug = nomeSafe
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const cep = endereco?.cep || "";
    const lat = endereco?.lat || null;
    const lng = endereco?.lng || null;

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO imoveis
      (
        titulo, slug, descricao, preco, tipo, status,
        cidade, bairro, endereco, cep, lat, lng,
        preco_condominio, preco_iptu, diferenciais
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomeSafe,
        slug,
        descricao || "",
        preco,
        tipo,
        status,
        endereco.cidade || "",
        endereco.bairro || "",
        `${endereco.rua || ""}, ${endereco.numero || ""}`,
        cep,
        lat,
        lng,
        precoCondominio,
        precoIptu,
        JSON.stringify(diferenciais)
      ]
    );

    const imovelId = result.insertId;

    await connection.query(
      `INSERT INTO imovel_detalhes
      (imovel_id, quartos, suites, banheiros, vagas, area)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        imovelId,
        Number(detalhes.quartos) || 0,
        Number(detalhes.suites) || 0,
        Number(detalhes.banheiros) || 0,
        Number(detalhes.vagas) || 0,
        Number(detalhes.area) || 0
      ]
    );

    if (imagens.length > 0) {
      const values = imagens.map(img => [imovelId, img]);
      await connection.query(
        `INSERT INTO imovel_imagens (imovel_id, url) VALUES ?`,
        [values]
      );
    }

    await connection.commit();
    connection.release();
    connection = null;
    clearPublicImoveisCache();

    const afterSnapshot = await getImovelSnapshot(imovelId);

    await logAudit(req, {
      action: "create",
      resourceType: "imovel",
      resourceId: imovelId,
      resourceTitle: afterSnapshot?.titulo || nomeSafe,
      details: {
        after: afterSnapshot || {
          id: imovelId,
          titulo: nomeSafe,
          preco,
          tipo,
          status,
          cidade: endereco.cidade || "",
          bairro: endereco.bairro || "",
          cep,
          imagens
        }
      }
    });

    return res.json({
      message: "Imóvel criado com sucesso",
      id: imovelId
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Erro ao desfazer cadastro do imóvel:", rollbackErr);
      }
      connection.release();
    }

    console.error("ERRO GERAL:", err);
    return res.status(500).json({ error: "Erro ao processar dados" });
  }
};

// ✅ LISTAR
const getImoveis = async (req, res) => {
  try {
    await ensurePropertyTrashColumn();
  } catch (err) {
    console.error("Erro ao preparar lixeira:", err);
    return res.status(500).json({ error: "Erro ao carregar imóveis" });
  }

  const sql = `
    SELECT
      i.*,
      d.quartos,
      d.banheiros,
      d.vagas,
      d.area,
      GROUP_CONCAT(img.url) as imagens
    FROM imoveis i
    LEFT JOIN imovel_detalhes d ON d.imovel_id = i.id
    LEFT JOIN imovel_imagens img ON img.imovel_id = i.id
    WHERE i.deleted_at IS NULL
    GROUP BY i.id
  `;

  if (publicImoveisCache && publicImoveisCache.expiresAt > Date.now()) {
    const data = publicImoveisCache.rows.map((item) => ({
      ...item,
      imagens: splitImageUrls(item.imagens, req)
    }));

    return res.json(data);
  }

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    publicImoveisCache = {
      rows: results,
      expiresAt: Date.now() + PUBLIC_IMOVEIS_CACHE_MS
    };

    const data = results.map((item) => ({
      ...item,
      imagens: splitImageUrls(item.imagens, req)
    }));

    res.json(data);
  });
};

const getDeletedImoveis = async (req, res) => {
  try {
    await ensurePropertyTrashColumn();
  } catch (err) {
    console.error("Erro ao preparar lixeira:", err);
    return res.status(500).json({ error: "Erro ao carregar lixeira" });
  }

  const sql = `
    SELECT
      i.*,
      d.quartos,
      d.suites,
      d.banheiros,
      d.vagas,
      d.area,
      GROUP_CONCAT(img.url) as imagens
    FROM imoveis i
    LEFT JOIN imovel_detalhes d ON d.imovel_id = i.id
    LEFT JOIN imovel_imagens img ON img.imovel_id = i.id
    WHERE i.deleted_at IS NOT NULL
    GROUP BY i.id
    ORDER BY i.deleted_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const data = results.map((item) => ({
      ...item,
      imagens: splitImageUrls(item.imagens, req)
    }));

    res.json(data);
  });
};

// ✅ DETALHE
const getImovelById = async (req, res) => {
  const id = req.params.id;

  try {
    await ensurePropertyTrashColumn();
  } catch (err) {
    console.error("Erro ao preparar lixeira:", err);
    return res.status(500).json({ error: "Erro ao carregar imóvel" });
  }

  const sql = `
    SELECT
      i.*,
      d.quartos,
      d.suites,
      d.banheiros,
      d.vagas,
      d.area,
      GROUP_CONCAT(img.url) as imagens
    FROM imoveis i
    LEFT JOIN imovel_detalhes d ON d.imovel_id = i.id
    LEFT JOIN imovel_imagens img ON img.imovel_id = i.id
    WHERE i.id = ? AND i.deleted_at IS NULL
    GROUP BY i.id
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    if (!results.length) {
      return res.status(404).json({ error: "Não encontrado" });
    }

    const imovel = results[0];

    res.json({
      ...imovel,

      // 🔥 imagens array
      imagens: splitImageUrls(imovel.imagens, req),

      // 🔥 diferenciais array
      diferenciais: parseJsonField(imovel.diferenciais, []),

      // 🔥 padronização pro front (IMPORTANTE)
      precoCondominio: imovel.preco_condominio || 0,
      precoIptu: imovel.preco_iptu || 0
    });
  });
};
// ✅ DELETAR
const deletarImovel = async (req, res) => {
  const id = req.params.id;

  try {
    await ensurePropertyTrashColumn();

    const before = await getImovelSnapshot(id);

    if (!before) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    if (before.deleted_at) {
      return res.status(400).json({ error: "Imóvel já está na lixeira" });
    }

    const [result] = await db.promise().query(
      "UPDATE imoveis SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    clearPublicImoveisCache();

    await logAudit(req, {
      action: "delete",
      resourceType: "imovel",
      resourceId: Number(id),
      resourceTitle: before.titulo,
      details: {
        before
      }
    });

    return res.json({ message: "Imóvel movido para a lixeira" });
  } catch (err) {
    console.error("Erro ao deletar imóvel:", err);
    return res.status(500).json({ error: "Erro ao deletar imóvel" });
  }
};

const restaurarImovel = async (req, res) => {
  const id = req.params.id;

  try {
    await ensurePropertyTrashColumn();

    const before = await getImovelSnapshot(id);

    if (!before) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    if (!before.deleted_at) {
      return res.status(400).json({ error: "Imóvel não está na lixeira" });
    }

    const [result] = await db.promise().query(
      "UPDATE imoveis SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    clearPublicImoveisCache();

    const after = await getImovelSnapshot(id);

    await logAudit(req, {
      action: "restore",
      resourceType: "imovel",
      resourceId: Number(id),
      resourceTitle: after?.titulo || before.titulo,
      details: {
        before,
        after
      }
    });

    return res.json({ message: "Imóvel restaurado com sucesso" });
  } catch (err) {
    console.error("Erro ao restaurar imóvel:", err);
    return res.status(500).json({ error: "Erro ao restaurar imóvel" });
  }
};

const atualizarImovel = async (req, res) => {
  const id = req.params.id;

  let beforeSnapshot = null;

  try {
    await ensurePropertyTrashColumn();
    beforeSnapshot = await getImovelSnapshot(id);
  } catch (error) {
    console.error("Erro ao carregar auditoria do imóvel:", error);
    return res.status(500).json({ error: "Erro ao carregar imóvel" });
  }

  if (!beforeSnapshot) {
    return res.status(404).json({ error: "Imóvel não encontrado" });
  }

  if (beforeSnapshot.deleted_at) {
    return res.status(400).json({ error: "Restaure o imóvel antes de editar" });
  }

  const {
    nome,
    descricao,
    status,
    tipo,
    preco,
    precoCondominio,
    precoIptu,
    diferenciais
  } = req.body;

  // =========================
  // SAFE STRING / SLUG
  // =========================
  const nomeSafe = (nome || "").trim() || "sem-nome";

  const slug = nomeSafe
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // =========================
  // SAFE JSON
  // =========================
  const safeParse = (data) => {
    if (!data) return {};
    if (typeof data === "object") return data;
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  const endereco = safeParse(req.body.endereco);
  const detalhes = safeParse(req.body.detalhes);

  // =========================
  // DIFERENCIAIS
  // =========================
  let diferenciaisSafe = [];
  try {
    diferenciaisSafe = typeof diferenciais === "string"
      ? JSON.parse(diferenciais)
      : (diferenciais || []);
  } catch {
    diferenciaisSafe = [];
  }

  // =========================
  // TIPO SAFE
  // =========================
  const tiposValidos = ["casa", "apartamento", "terreno", "comercial"];
  const tipoSafe = tiposValidos.includes(tipo) ? tipo : "casa";

  // =========================
  // IMAGENS — combina existentes + novas

  // 1️⃣ URLs que já existiam (o frontend manda de volta as que quer manter)
  let imagensExistentes = [];
  if (req.body.imagens) {
    try {
      imagensExistentes = typeof req.body.imagens === "string"
        ? JSON.parse(req.body.imagens)
        : req.body.imagens;
    } catch {
      imagensExistentes = [];
    }
  }

  const imagensExistentesRel = imagensExistentes
    .map(normalizeImagePathForStorage)
    .filter(Boolean);

  // 2️⃣ Arquivos novos enviados via upload
  const imagensNovas = req.files?.length > 0
    ? req.files.map((file) => `/uploads/imoveis/${file.filename}`)
    : [];

  // 3️⃣ Junta tudo e filtra valores inválidos
  const cleanImgs = [...imagensExistentesRel, ...imagensNovas]
    .filter(Boolean);

  const previousImages = (beforeSnapshot.imagens || [])
    .map(normalizeImagePathForStorage)
    .filter(Boolean);

  const imagesToRemove = previousImages.filter((img) => !cleanImgs.includes(img));

  await Promise.all(imagesToRemove.map(deleteImageFile));

  // =========================
  // ENDEREÇO
  const cep = endereco?.cep || "";
  const lat = endereco?.lat || null;
  const lng = endereco?.lng || null;

  const sendUpdateSuccess = async () => {
    try {
      const afterSnapshot = await getImovelSnapshot(id);

      await logAudit(req, {
        action: "update",
        resourceType: "imovel",
        resourceId: Number(id),
        resourceTitle: afterSnapshot?.titulo || beforeSnapshot.titulo || nomeSafe,
        details: {
          changes: buildImovelChanges(beforeSnapshot, afterSnapshot),
          before: beforeSnapshot,
          after: afterSnapshot
        }
      });

      clearPublicImoveisCache();

      return res.json({ message: "Imóvel atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao registrar auditoria:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Erro ao registrar auditoria" });
      }
    }
  };

  // =========================
  // UPDATE IMOVEL
  // =========================
  db.query(
    `UPDATE imoveis SET
      titulo=?,
      slug=?,
      descricao=?,
      preco=?,
      tipo=?,
      status=?,
      cidade=?,
      bairro=?,
      endereco=?,
      cep=?,
      lat=?,
      lng=?,
      preco_condominio=?,
      preco_iptu=?,
      diferenciais=?
     WHERE id=?`,
    [
      nomeSafe,
      slug,
      descricao || "",
      Number(preco) || 0,
      tipoSafe,
      status || "",
      endereco.cidade || "",
      endereco.bairro || "",
      `${endereco.rua || ""}, ${endereco.numero || ""}`,
      cep,
      lat,
      lng,
      Number(precoCondominio) || 0,
      Number(precoIptu) || 0,
      JSON.stringify(diferenciaisSafe),
      id
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao atualizar imóvel", detail: err });
      }

      // =========================
      // UPDATE DETALHES
      // =========================
      db.query(
        `UPDATE imovel_detalhes SET
          quartos=?,
          suites=?,
          banheiros=?,
          vagas=?,
          area=?
         WHERE imovel_id=?`,
        [
          detalhes.quartos || 0,
          detalhes.suites || 0,
          detalhes.banheiros || 0,
          detalhes.vagas || 0,
          detalhes.area || 0,
          id
        ],
        (err) => {
          if (err) {
            console.error("Erro ao atualizar detalhes:", err);
            return res.status(500).json({ error: "Erro ao atualizar detalhes" });
          }

          // =========================
          // REPLACE IMAGENS
          // =========================
          db.query("DELETE FROM imovel_imagens WHERE imovel_id=?", [id], (err) => {
            if (err) {
              console.error("Erro ao deletar imagens:", err);
              return res.status(500).json({ error: "Erro ao atualizar imagens" });
            }

            if (cleanImgs.length === 0) {
              return sendUpdateSuccess();
            }

            const values = cleanImgs.map(img => [id, img]);

            db.query(
              "INSERT INTO imovel_imagens (imovel_id, url) VALUES ?",
              [values],
              (err) => {
                if (err) {
                  console.error("Erro ao inserir imagens:", err);
                  return res.status(500).json({ error: "Erro ao salvar imagens" });
                }

                return sendUpdateSuccess();
              }
            );
          });
        }
      );
    }
  );
};

const deleteImovelImagem = async (req, res) => {
  const id = req.params.id;
  const imageId = req.params.imageId;

  try {
    const [results] = await db.promise().query(
      "SELECT url FROM imovel_imagens WHERE id = ? AND imovel_id = ?",
      [imageId, id]
    );

    if (!results.length) {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

    const imageUrl = results[0].url;

    const [result] = await db.promise().query(
      "DELETE FROM imovel_imagens WHERE id = ? AND imovel_id = ?",
      [imageId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

    await deleteImageFile(imageUrl);
    clearPublicImoveisCache();

    return res.json({ message: "Imagem removida com sucesso" });
  } catch (err) {
    console.error("Erro ao remover imagem do imóvel:", err);
    return res.status(500).json({ error: "Erro ao remover imagem" });
  }
};

module.exports = {
  ensurePropertyTrashColumn,
  ensureImageTable,
  criarImovel,
  getImoveis,
  getDeletedImoveis,
  getImovelById,
  deletarImovel,
  restaurarImovel,
  atualizarImovel,
  deleteImovelImagem
};
