const db = require("../database/db");

const CREATE_AUDIT_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INT NOT NULL AUTO_INCREMENT,
    actor_id INT NULL,
    actor_nome VARCHAR(100) NULL,
    actor_email VARCHAR(150) NULL,
    actor_role VARCHAR(30) NULL,
    action VARCHAR(30) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT NULL,
    resource_title VARCHAR(255) NULL,
    details LONGTEXT NULL,
    ip_address VARCHAR(64) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_created_at (created_at),
    KEY idx_audit_actor_id (actor_id),
    KEY idx_audit_action (action),
    KEY idx_audit_resource (resource_type, resource_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

let auditTableReady = null;

const ensureAuditTable = async () => {
  if (!auditTableReady) {
    auditTableReady = db.promise().query(CREATE_AUDIT_TABLE_SQL).catch((error) => {
      auditTableReady = null;
      throw error;
    });
  }

  await auditTableReady;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const safeJson = (value) => {
  try {
    return JSON.stringify(value || {});
  } catch {
    return JSON.stringify({ error: "Nao foi possivel serializar os detalhes" });
  }
};

const logAudit = async (req, event) => {
  try {
    const actor = req.user || {};
    await ensureAuditTable();

    await db.promise().query(
      `
        INSERT INTO audit_logs
        (
          actor_id,
          actor_nome,
          actor_email,
          actor_role,
          action,
          resource_type,
          resource_id,
          resource_title,
          details,
          ip_address,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        actor.id || null,
        actor.nome || null,
        actor.email || null,
        actor.role || null,
        event.action,
        event.resourceType,
        event.resourceId || null,
        event.resourceTitle || null,
        safeJson(event.details),
        getClientIp(req),
        String(req.headers["user-agent"] || "").slice(0, 255) || null
      ]
    );
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    await ensureAuditTable();

    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const action = String(req.query.action || "").trim();
    const params = [];

    let where = "";
    if (action) {
      where = "WHERE action = ?";
      params.push(action);
    }

    params.push(limit);

    const [rows] = await db.promise().query(
      `
        SELECT
          id,
          actor_id,
          actor_nome,
          actor_email,
          actor_role,
          action,
          resource_type,
          resource_id,
          resource_title,
          details,
          ip_address,
          user_agent,
          created_at
        FROM audit_logs
        ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `,
      params
    );

    const data = rows.map((row) => {
      let details = {};
      try {
        details = row.details ? JSON.parse(row.details) : {};
      } catch {
        details = {};
      }

      return {
        ...row,
        details
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  ensureAuditTable,
  logAudit,
  getAuditLogs
};
