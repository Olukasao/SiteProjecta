const db = require("../database/db");

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
const deletarImovel = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM imovel_imagens WHERE imovel_id = ?", [id]);
  db.query("DELETE FROM imovel_detalhes WHERE imovel_id = ?", [id]);

  db.query("DELETE FROM imoveis WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Deletado com sucesso" });
  });
};

const atualizarImovel = (req, res) => {
  const id = req.params.id;

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
  // 🔥 SAFE STRING
  // =========================
  const nomeSafe = (nome || "").trim() || "sem-nome";

  const slug = nomeSafe
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // =========================
  // 🔥 SAFE JSON
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
  // 🔥 DIFERENCIAIS
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
  // 🔥 TIPO SAFE
  // =========================
  const tiposValidos = ['casa', 'apartamento', 'terreno', 'comercial'];
  const tipoSafe = tiposValidos.includes(tipo) ? tipo : 'casa';

  // =========================
  // 🔥 IMAGENS
  // =========================
  let imagens = [];

  if (req.body.imagens) {
    if (typeof req.body.imagens === "string") {
      try {
        imagens = JSON.parse(req.body.imagens);
      } catch {
        imagens = [];
      }
    } else {
      imagens = req.body.imagens;
    }
  }
  const baseUrl = process.env.BASE_URL ||"http://localhost:3500" ;



  if (req.files && req.files.length > 0) {
    imagens = req.files.map(file =>
      `${baseUrl}/uploads/${file.filename}`
    );
  }

  const cleanImgs = (imagens || []).filter(
    img => typeof img === "string" && img.trim()
  );

  const cep = endereco?.cep || "";
  const lat = endereco?.lat || null;
  const lng = endereco?.lng || null;

  // =========================
  // 🔥 UPDATE IMOVEL (COMPLETO)
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
        return res.status(500).json(err);
      }

      // =========================
      // 🔥 DETALHES (AGORA COM SUITES)
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
        ]
      );

      // =========================
      // 🔥 IMAGENS (REPLACE)
      // =========================
      db.query("DELETE FROM imovel_imagens WHERE imovel_id=?", [id], () => {
        if (cleanImgs.length > 0) {
          const values = cleanImgs.map(img => [id, img]);

          db.query(
            "INSERT INTO imovel_imagens (imovel_id, url) VALUES ?",
            [values]
          );
        }
      });

      return res.json({
        message: "Imóvel atualizado com sucesso"
      });
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
