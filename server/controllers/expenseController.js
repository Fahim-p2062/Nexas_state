const pool = require('../config/db');

// Get expenses with optional property filter
const getExpenses = async (req, res) => {
  try {
    const { propertyId } = req.query;
    let query = `
      SELECT e.*, p.name as property_name
      FROM expenses e
      JOIN properties p ON e.property_id = p.property_id
      WHERE p.landlord_id = ?`;
    const params = [req.user.id];

    if (propertyId) {
      query += ' AND e.property_id = ?';
      params.push(propertyId);
    }

    query += ' ORDER BY e.expense_date DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create expense
const createExpense = async (req, res) => {
  try {
    const { property_id, category, amount, expense_date, description } = req.body;
    if (!property_id || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: 'Property, amount, and date are required.' });
    }

    // Verify property belongs to landlord
    const [prop] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [property_id, req.user.id]
    );
    if (prop.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO expenses (property_id, category, amount, expense_date, description) VALUES (?, ?, ?, ?, ?)',
      [property_id, category || 'Other', amount, expense_date, description || null]
    );

    const [newExpense] = await pool.query('SELECT * FROM expenses WHERE expense_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newExpense[0] });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getExpenses, createExpense };
