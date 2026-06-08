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
      multipleStatements: true
    });

    console.log('✅ Connected to local MySQL server. Inserting dummy data...');

    const sql = `
      CREATE TABLE IF NOT EXISTS staff_reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        reviewer_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
      );

      SET @ahon_id = (SELECT staff_id FROM staff WHERE email = 'ahon123@gmail.com' LIMIT 1);

      INSERT INTO maintenance_requests (unit_id, tenant_id, title, description, priority, status, submitted_at, resolved_at) VALUES
      (1, 1, 'Dummy Resolved Work 1', 'Testing resolved work 1', 'Low', 'Resolved', '2025-01-01 10:00:00', '2025-01-02 10:00:00'),
      (2, 2, 'Dummy Resolved Work 2', 'Testing resolved work 2', 'Low', 'Resolved', '2025-01-02 10:00:00', '2025-01-03 10:00:00'),
      (4, 3, 'Dummy Resolved Work 3', 'Testing resolved work 3', 'Low', 'Resolved', '2025-01-03 10:00:00', '2025-01-04 10:00:00'),
      (5, 1, 'Dummy Resolved Work 4', 'Testing resolved work 4', 'Low', 'Resolved', '2025-01-04 10:00:00', '2025-01-05 10:00:00'),
      (9, 6, 'Dummy Resolved Work 5', 'Testing resolved work 5', 'Low', 'Resolved', '2025-01-05 10:00:00', '2025-01-06 10:00:00'),
      (10, 7, 'Dummy Pending Work 1', 'Testing pending work 1', 'Low', 'Pending', '2025-01-06 10:00:00', NULL),
      (12, 8, 'Dummy Pending Work 2', 'Testing pending work 2', 'Low', 'Pending', '2025-01-07 10:00:00', NULL),
      (14, 10, 'Dummy Pending Work 3', 'Testing pending work 3', 'Low', 'Pending', '2025-01-08 10:00:00', NULL),
      (15, 11, 'Dummy Pending Work 4', 'Testing pending work 4', 'Low', 'Pending', '2025-01-09 10:00:00', NULL);

      INSERT INTO maintenance_assignments (request_id, staff_id, assigned_at, notes)
      SELECT request_id, @ahon_id, DATE_ADD(submitted_at, INTERVAL 1 HOUR), 'Ahon assigned'
      FROM maintenance_requests
      WHERE title LIKE 'Dummy % Work %'
      AND request_id NOT IN (SELECT request_id FROM maintenance_assignments);

      INSERT INTO staff_reviews (staff_id, reviewer_name, rating, comment) VALUES
      (@ahon_id, 'Arif Mahmud', 5, 'Ahon is a very skilled and fast worker.'),
      (@ahon_id, 'Sumaiya Islam', 4, 'He completed the job on time, but left a bit of a mess.'),
      (@ahon_id, 'Nabil Hasan', 5, 'Excellent service and very polite.');

      INSERT INTO notifications (user_id, user_role, message, type, is_read) VALUES
      (@ahon_id, 'Staff', 'New maintenance request assigned: Dummy Pending Work 1', 'Maintenance', FALSE),
      (@ahon_id, 'Staff', 'New maintenance request assigned: Dummy Pending Work 2', 'Maintenance', FALSE),
      (@ahon_id, 'Staff', 'You received a 5-star review from Arif Mahmud!', 'General', FALSE);

      CREATE OR REPLACE VIEW staff_performance_summary AS
      SELECT 
          s.staff_id,
          s.name AS Staff_Name,
          s.role AS Staff_Role,
          COUNT(DISTINCT ma.assignment_id) AS Total_Tasks_Assigned,
          SUM(CASE WHEN mr.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS Tasks_Completed,
          SUM(CASE WHEN mr.status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS Tasks_Pending,
          COALESCE(AVG(sr.rating), 0) AS Average_Rating,
          COUNT(DISTINCT sr.review_id) AS Total_Reviews
      FROM staff s
      LEFT JOIN maintenance_assignments ma ON s.staff_id = ma.staff_id
      LEFT JOIN maintenance_requests mr ON ma.request_id = mr.request_id
      LEFT JOIN staff_reviews sr ON s.staff_id = sr.staff_id
      GROUP BY s.staff_id, s.name, s.role;
    `;

    await connection.query(sql);
    console.log('✅ Dummy data successfully inserted into local database!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
})();
