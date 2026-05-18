const pool = require('../config/db');

// Get audit logs (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const { table_name, performed_by_role, limit: rowLimit } = req.query;
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];

    if (table_name) { query += ' AND table_name = ?'; params.push(table_name); }
    if (performed_by_role) { query += ' AND performed_by_role = ?'; params.push(performed_by_role); }

    query += ' ORDER BY performed_at DESC';
    query += ` LIMIT ?`;
    params.push(parseInt(rowLimit) || 50);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get admin audit logs
const getAdminAuditLogs = async (req, res) => {
  try {
    const { admin_id, limit: rowLimit } = req.query;
    let query = `
      SELECT aal.*, a.name as admin_name 
      FROM admin_audit_logs aal
      JOIN admins a ON aal.admin_id = a.admin_id
      WHERE 1=1`;
    const params = [];

    if (admin_id) { query += ' AND aal.admin_id = ?'; params.push(admin_id); }

    query += ' ORDER BY aal.performed_at DESC';
    query += ` LIMIT ?`;
    params.push(parseInt(rowLimit) || 50);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get admin audit logs error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAuditLogs, getAdminAuditLogs };
