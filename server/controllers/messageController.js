const pool = require('../config/db');

// Get messages for current user (conversations)
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { withId, withRole } = req.query;

    let query = `
      SELECT m.*, 
        CASE 
          WHEN m.sender_role = 'Landlord' THEN (SELECT name FROM landlords WHERE landlord_id = m.sender_id)
          WHEN m.sender_role = 'Tenant' THEN (SELECT name FROM tenants WHERE tenant_id = m.sender_id)
          WHEN m.sender_role = 'Staff' THEN (SELECT name FROM staff WHERE staff_id = m.sender_id)
        END as sender_name,
        CASE 
          WHEN m.receiver_role = 'Landlord' THEN (SELECT name FROM landlords WHERE landlord_id = m.receiver_id)
          WHEN m.receiver_role = 'Tenant' THEN (SELECT name FROM tenants WHERE tenant_id = m.receiver_id)
          WHEN m.receiver_role = 'Staff' THEN (SELECT name FROM staff WHERE staff_id = m.receiver_id)
        END as receiver_name
      FROM messages m
      WHERE (m.sender_id = ? AND m.sender_role = ?) OR (m.receiver_id = ? AND m.receiver_role = ?)`;
    const params = [userId, userRole, userId, userRole];

    // Filter conversation with specific user
    if (withId && withRole) {
      query += ` AND (
        (m.sender_id = ? AND m.sender_role = ?) OR 
        (m.receiver_id = ? AND m.receiver_role = ?)
      )`;
      params.push(withId, withRole, withId, withRole);
    }

    query += ' ORDER BY m.sent_at ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get conversation list (unique contacts)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const [rows] = await pool.query(
      `SELECT 
        CASE WHEN m.sender_id = ? AND m.sender_role = ? THEN m.receiver_id ELSE m.sender_id END as contact_id,
        CASE WHEN m.sender_id = ? AND m.sender_role = ? THEN m.receiver_role ELSE m.sender_role END as contact_role,
        MAX(m.sent_at) as last_message_at,
        (SELECT message_text FROM messages m2 
         WHERE ((m2.sender_id = m.sender_id AND m2.sender_role = m.sender_role AND m2.receiver_id = m.receiver_id AND m2.receiver_role = m.receiver_role)
           OR (m2.sender_id = m.receiver_id AND m2.sender_role = m.receiver_role AND m2.receiver_id = m.sender_id AND m2.receiver_role = m.sender_role))
         ORDER BY m2.sent_at DESC LIMIT 1) as last_message
      FROM messages m
      WHERE (m.sender_id = ? AND m.sender_role = ?) OR (m.receiver_id = ? AND m.receiver_role = ?)
      GROUP BY contact_id, contact_role
      ORDER BY last_message_at DESC`,
      [userId, userRole, userId, userRole, userId, userRole, userId, userRole]
    );

    // Resolve contact names
    for (const row of rows) {
      let nameQuery;
      if (row.contact_role === 'Landlord') {
        nameQuery = 'SELECT name FROM landlords WHERE landlord_id = ?';
      } else if (row.contact_role === 'Tenant') {
        nameQuery = 'SELECT name FROM tenants WHERE tenant_id = ?';
      } else if (row.contact_role === 'Staff') {
        nameQuery = 'SELECT name FROM staff WHERE staff_id = ?';
      }
      if (nameQuery) {
        const [names] = await pool.query(nameQuery, [row.contact_id]);
        row.contact_name = names.length > 0 ? names[0].name : 'Unknown';
      }
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, receiver_role, message_text } = req.body;
    if (!receiver_id || !receiver_role || !message_text) {
      return res.status(400).json({ success: false, message: 'Receiver ID, role, and message text are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, message_text) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, receiver_id, req.user.role, receiver_role, message_text]
    );

    const [newMsg] = await pool.query('SELECT * FROM messages WHERE message_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newMsg[0] });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMessages, getConversations, sendMessage };
