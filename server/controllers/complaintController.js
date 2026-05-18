const pool = require('../config/db');

// Tenant creates an objection tied to their lease/property (admin monitors)
const createComplaint = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { lease_id, staff_id, against_role, against_id, subject, description } = req.body;

    if (!lease_id || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Lease ID, subject, and description are required.' });
    }

    // Ensure lease belongs to tenant and get landlord_id via property
    const [leaseRows] = await pool.query(
      `SELECT l.lease_id, p.landlord_id
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.lease_id = ? AND l.tenant_id = ?`,
      [lease_id, tenantId]
    );
    if (leaseRows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }
    const landlordId = leaseRows[0].landlord_id;

    // Determine target: Landlord (default) or Staff
    let targetRole = against_role;
    let targetId = against_id;

    // Back-compat: staff_id implies Staff target
    if (!targetRole && staff_id) targetRole = 'Staff';
    if (!targetId && staff_id) targetId = staff_id;

    if (targetRole === 'Staff') {
      const [staffRows] = await pool.query(
        'SELECT staff_id FROM staff WHERE staff_id = ? AND landlord_id = ?',
        [targetId, landlordId]
      );
      if (staffRows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid staff ID for this lease/landlord.' });
      }
    } else {
      targetRole = 'Landlord';
      targetId = landlordId;
    }

    const [result] = await pool.query(
      `INSERT INTO objections (tenant_id, against_role, against_id, subject, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tenantId,
        targetRole,
        targetId,
        subject,
        description,
      ]
    );

    const [created] = await pool.query('SELECT * FROM objections WHERE objection_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// List objections based on role
const getComplaints = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT o.*,
        t.name as tenant_name,
        ll.name as landlord_name,
        s.name as staff_name
      FROM objections o
      JOIN tenants t ON o.tenant_id = t.tenant_id
      LEFT JOIN landlords ll ON (o.against_role = 'Landlord' AND o.against_id = ll.landlord_id)
      LEFT JOIN staff s ON (o.against_role = 'Staff' AND o.against_id = s.staff_id)
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'Tenant') {
      query += ' AND o.tenant_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'Landlord') {
      // Landlord sees objections against them OR against their staff
      query += ` AND (
        (o.against_role = 'Landlord' AND o.against_id = ?)
        OR
        (o.against_role = 'Staff' AND EXISTS (SELECT 1 FROM staff st WHERE st.staff_id = o.against_id AND st.landlord_id = ?))
      )`;
      params.push(req.user.id, req.user.id);
    } else if (req.user.role === 'Admin') {
      // no filter
    } else {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin updates objection status/resolution
const updateComplaint = async (req, res) => {
  try {
    const objectionId = req.params.id;
    const { status, admin_note } = req.body;

    if (!status || !['Open', 'Under Review', 'Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status required.' });
    }

    const [existing] = await pool.query('SELECT * FROM objections WHERE objection_id = ?', [objectionId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Objection not found.' });
    }

    const resolvedAt = (status === 'Resolved' || status === 'Dismissed') ? new Date() : null;
    await pool.query(
      `UPDATE objections
       SET status = ?, admin_note = ?, reviewed_by = ?, resolved_at = COALESCE(?, resolved_at)
       WHERE objection_id = ?`,
      [status, admin_note || null, req.user.id, resolvedAt, objectionId]
    );

    const [updated] = await pool.query('SELECT * FROM objections WHERE objection_id = ?', [objectionId]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update complaint error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaint };

