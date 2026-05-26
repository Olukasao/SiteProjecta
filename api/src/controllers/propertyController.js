const db = require("../database/db");
const { logAudit } = require("./auditController");

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
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

const criarImovel = (req, res) => {
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
    const baseUrl = process.env.BASE_URL;

    const imagens = req.files?.map(file =>
      `${baseUrl}/uploads/${file.filename}`
    ) || [];

    // =========================
    // 🔥 SLUG
    // =========================
    const slug = (nome || "sem-nome")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const cep = endereco?.cep || "";
    const lat = endereco?.lat || null;
    const lng = endereco?.lng || null;

    // =========================
    // 🔥 INSERT IMOVEL (AGORA COMPLETO)
    // =========================
    db.query(
      `INSERT INTO imoveis 
      (
        titulo, slug, descricao, preco, tipo, status,
        cidade, bairro, endereco, cep, lat, lng,
        preco_condominio, preco_iptu, diferenciais
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        slug,
        descricao,
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
      ],
      (err, result) => {
        if (err) {
          console.error("Erro imovel:", err);
          return res.status(500).json(err);
        }

        const imovelId = result.insertId;

        // =========================
        // 🔥 DETALHES (COM SUITES)
        // =========================
        db.query(
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

        // =========================
        // 🔥 IMAGENS
        // =========================
        if (imagens.length > 0) {
          const values = imagens.map(img => [imovelId, img]);

          db.query(
            `INSERT INTO imovel_imagens (imovel_id, url) VALUES ?`,
            [values],
            (err3) => {
              if (err3) {
                console.error("Erro imagens:", err3);
              }
            }
          );
        }

        logAudit(req, {
          action: "create",
          resourceType: "imovel",
          resourceId: imovelId,
          resourceTitle: nome,
          details: {
            after: {
              id: imovelId,
              titulo: nome,
              preco,
              tipo,
              status,
              cidade: endereco.cidade || "",
              bairro: endereco.bairro || "",
              cep,
              imagens: imagens.length
            }
          }
        });

        return res.json({
          message: "Imóvel criado com sucesso",
          id: imovelId
        });
      }
    );

  } catch (err) {
    console.error("ERRO GERAL:", err);
    res.status(500).json({ error: "Erro ao processar dados" });
  }
};

// ✅ LISTAR
const getImoveis = (req, res) => {
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
    GROUP BY i.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const data = results.map((item) => ({
      ...item,
      imagens: item.imagens ? item.imagens.split(",") : []
    }));

    res.json(data);
  });
};

// ✅ DETALHE
const getImovelById = (req, res) => {
  const id = req.params.id;

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
    WHERE i.id = ?
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
      imagens: imovel.imagens ? imovel.imagens.split(",") : [],

      // 🔥 diferenciais array
      diferenciais: imovel.diferenciais
        ? JSON.parse(imovel.diferenciais)
        : [],

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
    const before = await getImovelSnapshot(id);

    if (!before) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    await db.promise().query("DELETE FROM imovel_imagens WHERE imovel_id = ?", [id]);
    await db.promise().query("DELETE FROM imovel_detalhes WHERE imovel_id = ?", [id]);

    const [result] = await db.promise().query("DELETE FROM imoveis WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    await logAudit(req, {
      action: "delete",
      resourceType: "imovel",
      resourceId: Number(id),
      resourceTitle: before.titulo,
      details: {
        before
      }
    });

    return res.json({ message: "Deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar imóvel:", err);
    return res.status(500).json({ error: "Erro ao deletar imóvel" });
  }
};

const atualizarImovel = async (req, res) => {
  const id = req.params.id;

  let beforeSnapshot = null;

  try {
    beforeSnapshot = await getImovelSnapshot(id);
  } catch (error) {
    console.error("Erro ao carregar auditoria do imóvel:", error);
    return res.status(500).json({ error: "Erro ao carregar imóvel" });
  }

  if (!beforeSnapshot) {
    return res.status(404).json({ error: "Imóvel não encontrado" });
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
  // =========================
  const baseUrl = process.env.BASE_URL || "http://localhost:3500";

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

  // 2️⃣ Arquivos novos enviados via upload
  const imagensNovas = req.files?.length > 0
    ? req.files.map(file => `${baseUrl}/uploads/${file.filename}`)
    : [];

  // 3️⃣ Junta tudo e filtra valores inválidos
  const cleanImgs = [...imagensExistentes, ...imagensNovas].filter(
    img => typeof img === "string" && img.trim()
  );

  // =========================
  // ENDEREÇO
  // =========================
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


module.exports = {
  criarImovel,
  getImoveis,
  getImovelById,
  deletarImovel,
  atualizarImovel
};
