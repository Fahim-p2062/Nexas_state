// ─────────────────────────────────────────────────────────────
//  NexasEstate — Database Setup
//  
//  The database schema is managed externally via MySQL Workbench.
//  Run the schema SQL directly in MySQL Workbench, then use this
//  script only to verify the connection and list tables.
// ─────────────────────────────────────────────────────────────

const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nexasestate',
    });

    console.log('✅ Connected to MySQL server.');

    // Verify tables
    const [rows] = await connection.query('SHOW TABLES');
    console.log(`\nTables in '${process.env.DB_NAME || 'nexasestate'}' (${rows.length}):`);
    rows.forEach(r => console.log(`  ✓ ${Object.values(r)[0]}`));

    console.log('\n✅ Database connection verified successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
})();
