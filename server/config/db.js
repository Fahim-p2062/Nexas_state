const mysql = require('mysql2/promise');
require('dotenv').config();

// ───────────────────────────────────────────────────────────
//  MySQL Connection Pool — NexasEstate Property Management
// ───────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexasestate',
  port: parseInt(process.env.DB_PORT, 10) || 3306,

  // Pool behaviour
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  maxIdle: 10,

  // Keep-alive so idle connections are not dropped by the server
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,       // 10 seconds

  // Character set
  charset: 'utf8mb4',

  // Timezone aligned with the MySQL server
  timezone: '+00:00',

  // Return DATE / DATETIME as strings to avoid JS Date auto-conversion
  dateStrings: true,
});

// ── Startup connection test ─────────────────────────────────
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL connected successfully — database: ${process.env.DB_NAME}`);
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection FAILED:', err.message);
    console.error('   Please verify your .env credentials and that the MySQL server is running.');
  }
})();

module.exports = pool;
