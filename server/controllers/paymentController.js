const pool = require('../config/db');

// Get payments with filters
const getPayments = async (req, res) => {
  try {
    const { leaseId, status, month, year } = req.query;
    let query = `
      SELECT py.*, t.name as tenant_name, u.unit_number, p.name as property_name
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ?`;
    const params = [req.user.id];

    if (leaseId) { query += ' AND py.lease_id = ?'; params.push(leaseId); }
    if (status) { query += ' AND py.status = ?'; params.push(status); }
    if (month && year) {
      query += ' AND py.rent_month = ? AND py.rent_year = ?';
      params.push(month, year);
    }

    query += ' ORDER BY py.due_date DESC, py.payment_date DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single payment
const getPaymentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT py.*, t.name as tenant_name, u.unit_number, p.name as property_name
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE py.payment_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const { lease_id, amount, late_fee_amount, payment_date, due_date, rent_month, rent_year, method, status, reference_no, notes } = req.body;
    if (!lease_id || !amount) {
      return res.status(400).json({ success: false, message: 'Lease ID and amount are required.' });
    }

    // Verify lease exists AND belongs to this landlord
    const [lease] = await pool.query(
      `SELECT l.*
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.lease_id = ? AND p.landlord_id = ?`,
      [lease_id, req.user.id]
    );
    if (lease.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease not found.' });
    }

    const [result] = await pool.query(
      `INSERT INTO payments (lease_id, amount, late_fee_amount, payment_date, due_date, rent_month, rent_year, method, status, reference_no, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lease_id, amount, late_fee_amount || 0.00,
        payment_date || null, due_date || null,
        rent_month || null, rent_year || null,
        method || 'Cash', status || 'Paid',
        reference_no || null, notes || null
      ]
    );

    // Notify tenant
    await pool.query(
      "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Tenant', ?, 'Payment')",
      [lease[0].tenant_id, `Payment of ৳${amount} recorded for ${rent_month || ''} ${rent_year || ''}.`]
    );

    const [newPayment] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newPayment[0] });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { amount, late_fee_amount, payment_date, due_date, rent_month, rent_year, method, status, reference_no, notes } = req.body;

    // Verify payment belongs to landlord
    const [existing] = await pool.query(
      `SELECT py.*
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE py.payment_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const current = existing[0];
    await pool.query(
      `UPDATE payments SET amount = ?, late_fee_amount = ?, payment_date = ?, due_date = ?, 
       rent_month = ?, rent_year = ?, method = ?, status = ?, reference_no = ?, notes = ?
       WHERE payment_id = ?`,
      [
        amount || current.amount,
        late_fee_amount !== undefined ? late_fee_amount : current.late_fee_amount,
        payment_date !== undefined ? payment_date : current.payment_date,
        due_date !== undefined ? due_date : current.due_date,
        rent_month || current.rent_month,
        rent_year || current.rent_year,
        method || current.method,
        status || current.status,
        reference_no !== undefined ? reference_no : current.reference_no,
        notes !== undefined ? notes : current.notes,
        req.params.id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get overdue payments
const getOverduePayments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT py.*, t.name as tenant_name, t.phone as tenant_phone, 
              u.unit_number, p.name as property_name
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ? AND (py.status = 'Overdue' OR py.status = 'Pending')
      ORDER BY py.due_date ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get overdue payments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getPayments, getPaymentById, createPayment, updatePayment, getOverduePayments };
