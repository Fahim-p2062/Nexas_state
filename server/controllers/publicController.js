const pool = require('../config/db');

// Get all available (vacant) units for public browsing — no auth needed
const getPublicProperties = async (req, res) => {
  try {
    const { city, type, minRent, maxRent, search } = req.query;

    let query = `
      SELECT p.property_id, p.name as property_name, p.address, p.city, p.type,
        COUNT(u.unit_id) as total_units,
        SUM(CASE WHEN u.status = 'Vacant' THEN 1 ELSE 0 END) as vacant_units,
        MIN(u.rent_amount) as min_rent,
        MAX(u.rent_amount) as max_rent
      FROM properties p
      LEFT JOIN units u ON p.property_id = u.property_id
      WHERE 1=1`;
    const params = [];

    if (city) { query += ' AND p.city LIKE ?'; params.push(`%${city}%`); }
    if (type) { query += ' AND p.type = ?'; params.push(type); }
    if (search) { query += ' AND (p.name LIKE ? OR p.address LIKE ? OR p.city LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    query += ' GROUP BY p.property_id HAVING vacant_units > 0';

    if (minRent) { query += ' AND min_rent >= ?'; params.push(parseFloat(minRent)); }
    if (maxRent) { query += ' AND max_rent <= ?'; params.push(parseFloat(maxRent)); }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Public properties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get details of a specific property (public)
const getPublicPropertyDetail = async (req, res) => {
  try {
    const [property] = await pool.query(
      'SELECT property_id, name, address, city, type FROM properties WHERE property_id = ?',
      [req.params.id]
    );
    if (property.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Only show vacant units to visitors
    const [units] = await pool.query(
      `SELECT unit_id, unit_number, floor, bedrooms, bathrooms, area_sqft, rent_amount, status
       FROM units WHERE property_id = ? AND status = 'Vacant'
       ORDER BY unit_number`,
      [req.params.id]
    );

    // Get amenities if any
    const [amenities] = await pool.query(
      `SELECT a.name FROM amenities a 
       JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
       WHERE pa.property_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...property[0],
        units,
        amenities: amenities.map(a => a.name),
      }
    });
  } catch (err) {
    console.error('Public property detail error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getPublicProperties, getPublicPropertyDetail };
