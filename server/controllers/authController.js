const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Register Landlord
const registerLandlord = async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT landlord_id FROM landlords WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO landlords (name, email, password_hash, contact) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, contact || null]
    );

    const token = jwt.sign(
      { id: result.insertId, role: 'Landlord', name, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: result.insertId, name, email, role: 'Landlord' } }
    });
  } catch (err) {
    console.error('Register landlord error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Register Tenant
const registerTenant = async (req, res) => {
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

    const token = jwt.sign(
      { id: result.insertId, role: 'Tenant', name, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: result.insertId, name, email, role: 'Tenant' } }
    });
  } catch (err) {
    console.error('Register tenant error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Login (all roles including Admin)
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user = null;
    const loginRole = role || 'Landlord';

    if (loginRole === 'Admin') {
      const [rows] = await pool.query(
        'SELECT admin_id as id, name, email, password_hash, role as admin_role, is_active FROM admins WHERE email = ?',
        [email]
      );
      if (rows.length > 0) user = { ...rows[0], role: 'Admin' };
    } else if (loginRole === 'Landlord') {
      const [rows] = await pool.query('SELECT landlord_id as id, name, email, password_hash FROM landlords WHERE email = ?', [email]);
      if (rows.length > 0) user = { ...rows[0], role: 'Landlord' };
    } else if (loginRole === 'Tenant') {
      const [rows] = await pool.query('SELECT tenant_id as id, name, email, password_hash FROM tenants WHERE email = ?', [email]);
      if (rows.length > 0) user = { ...rows[0], role: 'Tenant' };
    } else if (loginRole === 'Staff') {
      const [rows] = await pool.query('SELECT staff_id as id, name, email, password_hash, landlord_id, role as job_title, phone FROM staff WHERE email = ?', [email]);
      if (rows.length > 0) user = { ...rows[0], role: 'Staff' };
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Your ID & password was incorrect.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'Account not set up for login.' });
    }

    if (user.role === 'Admin' && user.is_active === 0) {
      return res.status(403).json({ success: false, message: 'Admin account is inactive.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Your ID & password was incorrect.' });
    }

    const tokenPayload = { id: user.id, role: user.role, name: user.name, email: user.email };
    if (user.landlord_id) tokenPayload.landlord_id = user.landlord_id;
    if (user.admin_role) tokenPayload.admin_role = user.admin_role;

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...(user.admin_role ? { admin_role: user.admin_role } : {}),
          ...(user.job_title ? { job_title: user.job_title, phone: user.phone } : {})
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { registerLandlord, registerTenant, login };
