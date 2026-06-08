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

    // Find Ahon's actual staff_id
    const [ahonRows] = await connection.query('SELECT staff_id FROM staff WHERE email = ?', ['ahon123@gmail.com']);
    
    if (ahonRows.length === 0) {
      console.log('❌ Ahon Staff not found in the database!');
      return;
    }
    
    const ahonId = ahonRows[0].staff_id;
    console.log(`Found Ahon Staff with ID: ${ahonId}`);

    // Update maintenance_assignments to Ahon where notes say 'Ahon assigned'
    const [updateAssignments] = await connection.query(
      `UPDATE maintenance_assignments SET staff_id = ? WHERE notes = 'Ahon assigned'`,
      [ahonId]
    );
    console.log(`Updated ${updateAssignments.affectedRows} maintenance assignments for Ahon.`);

    // Update staff_reviews to Ahon
    const [updateReviews] = await connection.query(
      `UPDATE staff_reviews SET staff_id = ? WHERE reviewer_name = 'Arif Mahmud' AND comment LIKE '%Ahon%'`,
      [ahonId]
    );
    console.log(`Updated ${updateReviews.affectedRows} staff reviews for Ahon.`);

    // Update notifications to Ahon
    const [updateNotifs] = await connection.query(
      `UPDATE notifications SET user_id = ? WHERE user_role = 'Staff' AND (message LIKE '%Dummy%' OR message LIKE '%Ahon%')`,
      [ahonId]
    );
    console.log(`Updated ${updateNotifs.affectedRows} notifications for Ahon.`);

    console.log('\n✅ Database fix applied successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
})();
