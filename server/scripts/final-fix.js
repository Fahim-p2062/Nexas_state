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

    // Fix the staff_performance_summary view to avoid cartesian product
    const fixViewSql = `
      CREATE OR REPLACE VIEW staff_performance_summary AS
      SELECT 
          s.staff_id,
          s.name AS Staff_Name,
          s.role AS Staff_Role,
          COALESCE(t.Total_Tasks_Assigned, 0) AS Total_Tasks_Assigned,
          COALESCE(t.Tasks_Completed, 0) AS Tasks_Completed,
          COALESCE(t.Tasks_Pending, 0) AS Tasks_Pending,
          COALESCE(r.Average_Rating, 0) AS Average_Rating,
          COALESCE(r.Total_Reviews, 0) AS Total_Reviews
      FROM staff s
      LEFT JOIN (
          SELECT 
              ma.staff_id,
              COUNT(ma.assignment_id) AS Total_Tasks_Assigned,
              SUM(CASE WHEN mr.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS Tasks_Completed,
              SUM(CASE WHEN mr.status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS Tasks_Pending
          FROM maintenance_assignments ma
          JOIN maintenance_requests mr ON ma.request_id = mr.request_id
          GROUP BY ma.staff_id
      ) t ON s.staff_id = t.staff_id
      LEFT JOIN (
          SELECT 
              staff_id,
              AVG(rating) AS Average_Rating,
              COUNT(review_id) AS Total_Reviews
          FROM staff_reviews
          GROUP BY staff_id
      ) r ON s.staff_id = r.staff_id;
    `;
    await connection.query(fixViewSql);
    console.log('✅ View staff_performance_summary fixed and updated.');

    // Assign Ahon Staff to Fahim Landlord so he is visible in the dashboard
    const [landlordRows] = await connection.query('SELECT landlord_id FROM landlords WHERE email = ?', ['fahim123@gmail.com']);
    if (landlordRows.length > 0) {
      const fahimId = landlordRows[0].landlord_id;
      
      const [updateStaff] = await connection.query(
        'UPDATE staff SET landlord_id = ? WHERE email = ? OR name LIKE ?',
        [fahimId, 'ahon123@gmail.com', '%Ahon%']
      );
      
      console.log(`✅ Updated ${updateStaff.affectedRows} Ahon Staff records to belong to Fahim Landlord (ID ${fahimId}).`);
    } else {
      console.log('❌ Fahim Landlord not found in DB.');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
})();
