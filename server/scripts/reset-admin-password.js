const bcrypt = require('bcrypt');
require('dotenv').config();
const pool = require('../config/db');

/**
 * Usage:
 *   node scripts/reset-admin-password.js "admin@email.com" "NewPassword123"
 *
 * This updates admins.password_hash with a fresh bcrypt hash
 * and sets is_active=TRUE.
 */
(async () => {
  try {
    const email = process.argv[2] || process.env.ADMIN_EMAIL;
    const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD;

    if (!email || !newPassword) {
      console.error('Missing args. Usage: node scripts/reset-admin-password.js "email" "newPassword"');
      process.exit(1);
    }

    const [existing] = await pool.query('SELECT admin_id, is_active FROM admins WHERE email = ?', [email]);
    if (existing.length === 0) {
      console.error('Admin not found for this email.');
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE admins SET password_hash = ?, is_active = TRUE WHERE email = ?',
      [password_hash, email]
    );

    console.log(`✅ Admin password reset for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to reset admin password:', err.message);
    process.exit(1);
  }
})();

