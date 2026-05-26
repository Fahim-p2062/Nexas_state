const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all staff for landlord
const getStaff = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT staff_id, landlord_id, name, email, role, phone, created_at 
      FROM staff WHERE landlord_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create staff
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const [existing] = await pool.query('SELECT staff_id FROM staff WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      'INSERT INTO staff (landlord_id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, email, password_hash, role || null, phone || null]
    );

    const [newStaff] = await pool.query(
      'SELECT staff_id, landlord_id, name, email, role, phone, created_at FROM staff WHERE staff_id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, data: newStaff[0] });
  } catch (err) {
    console.error('Create staff error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { name, role, phone } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM staff WHERE staff_id = ? AND landlord_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE staff SET name = ?, role = ?, phone = ? WHERE staff_id = ?',
      [name || current.name, role || current.role, phone || current.phone, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT staff_id, landlord_id, name, email, role, phone, created_at FROM staff WHERE staff_id = ?',
      [req.params.id]
    );
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update staff error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getStaffMeStats = async (req, res) => {
  try {
    const staffId = req.user.id;

    const [tasks] = await pool.query(
      `SELECT mr.status FROM maintenance_requests mr
       JOIN maintenance_assignments ma ON mr.request_id = ma.request_id
       WHERE ma.staff_id = ?`,
       [staffId]
    );

    const completed = tasks.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const remaining = tasks.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

    const [reviews] = await pool.query('SELECT * FROM staff_reviews WHERE staff_id = ? ORDER BY created_at DESC', [staffId]);
    
    // Calculate average rating
    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

    res.json({ success: true, data: { completed, remaining, reviews, avgRating } });
  } catch (err) {
    console.error('Get staff stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStaff, createStaff, updateStaff, getStaffMeStats };
