const pool = require('../config/db');

// Get notifications for logged-in user
const getMyNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id, req.user.role]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ? AND user_role = ?',
      [req.params.id, req.user.id, req.user.role]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await pool.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMyNotifications, markAsRead };
