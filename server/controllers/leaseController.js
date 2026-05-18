const pool = require('../config/db');

// Get all leases
const getLeases = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const [rows] = await pool.query(
      `SELECT l.*, t.name as tenant_name, t.email as tenant_email, 
              u.unit_number, p.name as property_name
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ?
      ORDER BY l.created_at DESC`,
      [landlordId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get leases error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single lease
const getLeaseById = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const [rows] = await pool.query(
      `SELECT l.*, t.name as tenant_name, t.email as tenant_email, t.phone as tenant_phone,
              u.unit_number, u.rent_amount as unit_rent, p.name as property_name, p.address as property_address
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.lease_id = ? AND p.landlord_id = ?`,
      [req.params.id, landlordId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease not found.' });
    }

    // Get payments for this lease
    const [payments] = await pool.query(
      `SELECT py.*
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE py.lease_id = ? AND p.landlord_id = ?
      ORDER BY py.payment_date DESC`,
      [req.params.id, landlordId]
    );

    // Get documents for this lease
    const [documents] = await pool.query(
      `SELECT d.*
      FROM documents d
      JOIN leases l ON d.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE d.lease_id = ? AND p.landlord_id = ?
      ORDER BY d.uploaded_at DESC`,
      [req.params.id, landlordId]
    );

    res.json({ success: true, data: { ...rows[0], payments, documents } });
  } catch (err) {
    console.error('Get lease error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create lease
const createLease = async (req, res) => {
  try {
    const { unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit } = req.body;
    if (!unit_id || !tenant_id || !start_date || !end_date || !monthly_rent) {
      return res.status(400).json({ success: false, message: 'Unit, tenant, dates, and monthly rent are required.' });
    }

    // Check unit exists and belongs to landlord
    const [unit] = await pool.query(
      `SELECT u.* FROM units u JOIN properties p ON u.property_id = p.property_id 
       WHERE u.unit_id = ? AND p.landlord_id = ?`,
      [unit_id, req.user.id]
    );
    if (unit.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }
    if (unit[0].status === 'Occupied') {
      return res.status(400).json({ success: false, message: 'Unit is already occupied.' });
    }

    // Check tenant exists
    const [tenant] = await pool.query('SELECT tenant_id FROM tenants WHERE tenant_id = ?', [tenant_id]);
    if (tenant.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO leases (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit) VALUES (?, ?, ?, ?, ?, ?)',
        [unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit || null]
      );

      // Auto-set unit status to Occupied
      await connection.query("UPDATE units SET status = 'Occupied' WHERE unit_id = ?", [unit_id]);

      // Create notification for tenant
      await connection.query(
        "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Tenant', ?, 'Lease')",
        [tenant_id, `A new lease has been created for you starting ${start_date}.`]
      );

      await connection.commit();

      const [newLease] = await pool.query(
        `SELECT l.*, t.name as tenant_name, u.unit_number, p.name as property_name
        FROM leases l
        JOIN tenants t ON l.tenant_id = t.tenant_id
        JOIN units u ON l.unit_id = u.unit_id
        JOIN properties p ON u.property_id = p.property_id
        WHERE l.lease_id = ?`,
        [result.insertId]
      );

      res.status(201).json({ success: true, data: newLease[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Create lease error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update lease status
const updateLeaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Expired', 'Terminated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required (Active, Expired, Terminated).' });
    }

    const [existing] = await pool.query(
      `SELECT l.*
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.lease_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lease not found.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('UPDATE leases SET status = ? WHERE lease_id = ?', [status, req.params.id]);

      // If terminated or expired, set unit to Vacant
      if (status === 'Terminated' || status === 'Expired') {
        await connection.query("UPDATE units SET status = 'Vacant' WHERE unit_id = ?", [existing[0].unit_id]);

        // Notify tenant
        await connection.query(
          "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Tenant', ?, 'Lease')",
          [existing[0].tenant_id, `Your lease has been ${status.toLowerCase()}.`]
        );
      }

      await connection.commit();

      const [updated] = await pool.query('SELECT * FROM leases WHERE lease_id = ?', [req.params.id]);
      res.json({ success: true, data: updated[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Update lease status error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getLeases, getLeaseById, createLease, updateLeaseStatus };
