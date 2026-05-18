const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all tenants
const getTenants = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const [rows] = await pool.query(
      `SELECT
        t.tenant_id, t.name, t.email, t.nid, t.phone, t.emergency_contact, t.created_at,
        SUM(CASE WHEN l.status = 'Active' THEN 1 ELSE 0 END) as active_leases
      FROM tenants t
      JOIN leases l ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ?
      GROUP BY t.tenant_id
      ORDER BY MAX(t.created_at) DESC`,
      [landlordId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get tenants error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single tenant
const getTenantById = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const tenantId = req.params.id;

    // Ensure the tenant is linked to THIS landlord through a lease on landlord's properties
    const [rows] = await pool.query(
      `SELECT DISTINCT
        t.tenant_id, t.name, t.email, t.nid, t.phone, t.emergency_contact, t.created_at
      FROM tenants t
      JOIN leases l ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE t.tenant_id = ? AND p.landlord_id = ?`,
      [tenantId, landlordId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    // Get lease history
    const [leases] = await pool.query(
      `SELECT l.*, u.unit_number, p.name as property_name 
      FROM leases l 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE l.tenant_id = ? AND p.landlord_id = ?
      ORDER BY l.start_date DESC`,
      [tenantId, landlordId]
    );

    res.json({ success: true, data: { ...rows[0], leases } });
  } catch (err) {
    console.error('Get tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create tenant (by landlord)
const createTenant = async (req, res) => {
  try {
    const { name, email, password, nid, phone, emergency_contact } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT tenant_id FROM tenants WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO tenants (name, email, password_hash, nid, phone, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, nid || null, phone || null, emergency_contact || null]
    );

    const [newTenant] = await pool.query(
      'SELECT tenant_id, name, email, nid, phone, emergency_contact, created_at FROM tenants WHERE tenant_id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, data: newTenant[0] });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update tenant
const updateTenant = async (req, res) => {
  try {
    const { name, phone, nid, emergency_contact } = req.body;
    const landlordId = req.user.id;
    const tenantId = req.params.id;

    const [existing] = await pool.query(
      `SELECT t.*
      FROM tenants t
      JOIN leases l ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE t.tenant_id = ? AND p.landlord_id = ?
      LIMIT 1`,
      [tenantId, landlordId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE tenants SET name = ?, phone = ?, nid = ?, emergency_contact = ? WHERE tenant_id = ?',
      [name || current.name, phone || current.phone, nid || current.nid, emergency_contact || current.emergency_contact, tenantId]
    );

    const [updated] = await pool.query(
      'SELECT tenant_id, name, email, nid, phone, emergency_contact, created_at FROM tenants WHERE tenant_id = ?',
      [tenantId]
    );
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTenants, getTenantById, createTenant, updateTenant };
