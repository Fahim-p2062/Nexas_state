const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedDummyStaff() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log("Connected to database...");
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const landlordId = 1; // Assuming landlord 1 exists based on seed.sql
    
    const staffMembers = [
      { name: 'Ahon', email: 'ahon@nexasestate.com', role: 'Electrician', phone: '01700-111111' },
      { name: 'Jamal', email: 'jamal@nexasestate.com', role: 'Garbage Collector', phone: '01800-222222' },
      { name: 'Kamal', email: 'kamal_sg@nexasestate.com', role: 'Security Guard', phone: '01900-333333' },
      { name: 'Tuhin', email: 'tuhin@nexasestate.com', role: 'Water Supplier', phone: '01600-444444' },
      { name: 'Babu', email: 'babu@nexasestate.com', role: 'Electrician', phone: '01500-555555' }
    ];

    const staffIds = {};

    for (const staff of staffMembers) {
      const [result] = await connection.execute(
        `INSERT INTO staff (landlord_id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
        [landlordId, staff.name, staff.email, passwordHash, staff.role, staff.phone]
      );
      staffIds[staff.name] = result.insertId;
      console.log(`Inserted staff ${staff.name} with ID ${result.insertId}`);
    }

    // Now insert maintenance requests and assignments
    const requestsData = [
      // For Ahon
      { unit_id: 1, tenant_id: 1, title: 'Fix lighting in hallway', description: 'The hallway lights on 1st floor are not working.', priority: 'Medium', status: 'In Progress', staffName: 'Ahon', notes: 'Ahon is working on replacing the bulbs' },
      { unit_id: 2, tenant_id: 2, title: 'Replace circuit breaker', description: 'Circuit breaker trips frequently in Unit A-102.', priority: 'High', status: 'Pending', staffName: 'Ahon', notes: 'Scheduled for tomorrow' },
      { unit_id: 4, tenant_id: 3, title: 'Install new power outlet', description: 'Need an extra power outlet in the living room.', priority: 'Low', status: 'Pending', staffName: 'Ahon', notes: 'Waiting for parts' },
      
      // For Jamal
      { unit_id: 1, tenant_id: 1, title: 'Clear garbage from block A', description: 'Garbage has not been collected from block A for two days.', priority: 'Medium', status: 'In Progress', staffName: 'Jamal', notes: 'Jamal is clearing the area' },
      
      // For Kamal
      { unit_id: 2, tenant_id: 2, title: 'Night shift patrol request', description: 'Tenant reported suspicious activity near parking area.', priority: 'High', status: 'In Progress', staffName: 'Kamal', notes: 'Kamal assigned to night patrol' },
      
      // For Tuhin
      { unit_id: 4, tenant_id: 3, title: 'Fix water line issue', description: 'Low water pressure in bathroom.', priority: 'High', status: 'Pending', staffName: 'Tuhin', notes: 'Tuhin is checking the main supply line' }
    ];

    for (const req of requestsData) {
      const [reqResult] = await connection.execute(
        `INSERT INTO maintenance_requests (unit_id, tenant_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.unit_id, req.tenant_id, req.title, req.description, req.priority, req.status]
      );
      
      const reqId = reqResult.insertId;
      console.log(`Inserted maintenance request ID ${reqId} for ${req.staffName}`);
      
      const staffId = staffIds[req.staffName];
      await connection.execute(
        `INSERT INTO maintenance_assignments (request_id, staff_id, notes) VALUES (?, ?, ?)`,
        [reqId, staffId, req.notes]
      );
      console.log(`Assigned request ${reqId} to ${req.staffName} (Staff ID ${staffId})`);
    }

    console.log("Dummy data successfully inserted.");
  } catch (err) {
    console.error("Error inserting dummy data:", err);
  } finally {
    await connection.end();
  }
}

seedDummyStaff();
