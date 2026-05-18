const bcrypt = require('bcrypt');
require('dotenv').config();
const pool = require('../config/db');

/**
 * Usage:
 *   node scripts/create-admin.js "Admin Name" "admin@email.com" "password123"
 *
 * Or via env:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@email.com" ADMIN_PASSWORD="password123" node scripts/create-admin.js
 */
(async () => {
  try {
    const name = process.argv[2] || process.env.ADMIN_NAME;
    const email = process.argv[3] || process.env.ADMIN_EMAIL;
    const password = process.argv[4] || process.env.ADMIN_PASSWORD;
    const adminRole = process.argv[5] || process.env.ADMIN_ROLE || 'admin'; // 'admin' | 'super_admin'

    if (!name || !email || !password) {
      console.error('Missing admin details.');
      console.error('Provide: name email password [admin|super_admin] (args) OR ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD env vars.');
      process.exit(1);
    }

    const [existing] = await pool.query('SELECT admin_id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin already exists for this email.');
      process.exit(0);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [name, email, password_hash, adminRole === 'super_admin' ? 'super_admin' : 'admin']
    );

    console.log(`✅ Admin created (admin_id=${result.insertId}) for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
})();

