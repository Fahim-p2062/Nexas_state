const pool = require('../config/db');

// Get maintenance requests with filters
const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query, params;

    if (req.user.role === 'Tenant') {
      query = `SELECT mr.*, u.unit_number, p.name as property_name
        FROM maintenance_requests mr
        JOIN units u ON mr.unit_id = u.unit_id
        JOIN properties p ON u.property_id = p.property_id
        WHERE mr.tenant_id = ?`;
      params = [req.user.id];
    } else if (req.user.role === 'Staff') {
      query = `SELECT mr.*, u.unit_number, p.name as property_name, t.name as tenant_name
        FROM maintenance_requests mr
        JOIN units u ON mr.unit_id = u.unit_id
        JOIN properties p ON u.property_id = p.property_id
        JOIN tenants t ON mr.tenant_id = t.tenant_id
        JOIN maintenance_assignments ma ON ma.request_id = mr.request_id
        WHERE ma.staff_id = ?`;
      params = [req.user.id];
    } else {
      query = `SELECT mr.*, u.unit_number, p.name as property_name, t.name as tenant_name,
        (SELECT s.name FROM maintenance_assignments ma JOIN staff s ON ma.staff_id = s.staff_id WHERE ma.request_id = mr.request_id LIMIT 1) as assigned_staff
        FROM maintenance_requests mr
        JOIN units u ON mr.unit_id = u.unit_id
        JOIN properties p ON u.property_id = p.property_id
        JOIN tenants t ON mr.tenant_id = t.tenant_id
        WHERE p.landlord_id = ?`;
      params = [req.user.id];
    }

    if (status) { query += ' AND mr.status = ?'; params.push(status); }
    if (priority) { query += ' AND mr.priority = ?'; params.push(priority); }

    query += ' ORDER BY mr.submitted_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get maintenance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create maintenance request (tenant)
const createMaintenanceRequest = async (req, res) => {
  try {
    const { unit_id, title, description, priority } = req.body;
    if (!unit_id || !title) {
      return res.status(400).json({ success: false, message: 'Unit ID and title are required.' });
    }

    // Verify tenant has active lease for this unit
    const [lease] = await pool.query(
      "SELECT * FROM leases WHERE unit_id = ? AND tenant_id = ? AND status = 'Active'",
      [unit_id, req.user.id]
    );
    if (lease.length === 0) {
      return res.status(403).json({ success: false, message: 'You do not have an active lease for this unit.' });
    }

    const [result] = await pool.query(
      'INSERT INTO maintenance_requests (unit_id, tenant_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
      [unit_id, req.user.id, title, description || null, priority || 'Medium']
    );

    // Notify landlord
    const [prop] = await pool.query(
      'SELECT p.landlord_id FROM units u JOIN properties p ON u.property_id = p.property_id WHERE u.unit_id = ?',
      [unit_id]
    );
    if (prop.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Landlord', ?, 'Maintenance')",
        [prop[0].landlord_id, `New maintenance request: "${title}" (Priority: ${priority || 'Medium'})`]
      );
    }

    const [newReq] = await pool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newReq[0] });
  } catch (err) {
    console.error('Create maintenance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update maintenance request (landlord assigns staff, updates status)
const updateMaintenanceRequest = async (req, res) => {
  try {
    const { status, staff_id, notes } = req.body;
    const requestId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (status) {
        const updateData = { status };
        if (status === 'Resolved') updateData.resolved_at = new Date();
        
        await connection.query(
          'UPDATE maintenance_requests SET status = ?, resolved_at = ? WHERE request_id = ?',
          [status, status === 'Resolved' ? new Date() : existing[0].resolved_at, requestId]
        );

        // Notify tenant
        await connection.query(
          "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Tenant', ?, 'Maintenance')",
          [existing[0].tenant_id, `Your maintenance request "${existing[0].title}" status updated to: ${status}`]
        );
      }

      if (staff_id) {
        // Remove old assignment if exists
        await connection.query('DELETE FROM maintenance_assignments WHERE request_id = ?', [requestId]);
        // Create new assignment
        await connection.query(
          'INSERT INTO maintenance_assignments (request_id, staff_id, notes) VALUES (?, ?, ?)',
          [requestId, staff_id, notes || null]
        );

        // Notify staff
        await connection.query(
          "INSERT INTO notifications (user_id, user_role, message, type) VALUES (?, 'Staff', ?, 'Maintenance')",
          [staff_id, `You have been assigned to maintenance request: "${existing[0].title}"`]
        );

        // Set to In Progress if still Pending
        if (existing[0].status === 'Pending') {
          await connection.query(
            "UPDATE maintenance_requests SET status = 'In Progress' WHERE request_id = ?",
            [requestId]
          );
        }
      }

      await connection.commit();

      const [updated] = await pool.query('SELECT * FROM maintenance_requests WHERE request_id = ?', [requestId]);
      res.json({ success: true, data: updated[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Update maintenance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest };
