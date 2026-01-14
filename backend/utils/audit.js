import { pool } from "../db/mysql.js";

export async function logAction({
  actorId,
  action,
  targetModel,
  targetId,
  summary,
  ipAddress,
  metadata,
  details
}) {
  try {
    // Get user role
    const [[user]] = await pool.query(
      `SELECT role FROM users WHERE id = ?`,
      [actorId]
    );

    const userRole = user?.role || null;
    const meta = metadata ? JSON.stringify(metadata) : null;

    await pool.execute(
      `INSERT INTO audit_logs (
        actor_id, user_role, action, target_model, target_id, 
        summary, ip_address, metadata, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actorId,
        userRole,
        action,
        targetModel,
        targetId,
        summary || null,
        ipAddress || null,
        meta,
        details || null
      ]
    );
  } catch (e) {
    // Do not throw – audit failure must not break the primary flow
    console.error("Audit log failed", e.message);
  }
}
