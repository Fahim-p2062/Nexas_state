const pool = require('../config/db');

// Get utility bills for landlord's units (with filters)
const getUtilityBills = async (req, res) => {
  try {
    const { unitId, propertyId, status, billing_month } = req.query;
    let query = `
      SELECT ub.*, u.unit_number, p.name as property_name
      FROM utility_bills ub
      JOIN units u ON ub.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ?`;
    const params = [req.user.id];

    if (unitId) { query += ' AND ub.unit_id = ?'; params.push(unitId); }
    if (propertyId) { query += ' AND p.property_id = ?'; params.push(propertyId); }
    if (status) { query += ' AND ub.status = ?'; params.push(status); }
    if (billing_month) { query += ' AND ub.billing_month = ?'; params.push(billing_month); }

    query += ' ORDER BY ub.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get utility bills error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get utility bills for a tenant (their units only)
const getTenantUtilityBills = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const [rows] = await pool.query(
      `SELECT ub.*, u.unit_number, p.name as property_name
       FROM utility_bills ub
       JOIN units u ON ub.unit_id = u.unit_id
       JOIN properties p ON u.property_id = p.property_id
       JOIN leases l ON l.unit_id = u.unit_id AND l.tenant_id = ?
       WHERE l.status = 'Active'
       ORDER BY ub.created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get tenant utility bills error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create utility bill
const createUtilityBill = async (req, res) => {
  try {
    const { unit_id, utility_type, billing_month, amount, due_date, status } = req.body;
    if (!unit_id || !utility_type || !billing_month || !amount) {
      return res.status(400).json({ success: false, message: 'Unit, utility type, billing month, and amount are required.' });
    }

    // Verify unit belongs to landlord's property
    const [unit] = await pool.query(
      `SELECT u.* FROM units u JOIN properties p ON u.property_id = p.property_id 
       WHERE u.unit_id = ? AND p.landlord_id = ?`,
      [unit_id, req.user.id]
    );
    if (unit.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO utility_bills (unit_id, utility_type, billing_month, amount, due_date, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [unit_id, utility_type, billing_month, amount, due_date || null, status || 'Unpaid']
    );

    const [newBill] = await pool.query('SELECT * FROM utility_bills WHERE bill_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newBill[0] });
  } catch (err) {
    console.error('Create utility bill error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update utility bill status
const updateUtilityBill = async (req, res) => {
  try {
    const { status, amount, due_date } = req.body;

    const [existing] = await pool.query(
      `SELECT ub.*
       FROM utility_bills ub
       JOIN units u ON ub.unit_id = u.unit_id
       JOIN properties p ON u.property_id = p.property_id
       WHERE ub.bill_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Utility bill not found.' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE utility_bills SET status = ?, amount = ?, due_date = ? WHERE bill_id = ?',
      [
        status || current.status,
        amount || current.amount,
        due_date !== undefined ? due_date : current.due_date,
        req.params.id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM utility_bills WHERE bill_id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update utility bill error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getUtilityBills, getTenantUtilityBills, createUtilityBill, updateUtilityBill };
