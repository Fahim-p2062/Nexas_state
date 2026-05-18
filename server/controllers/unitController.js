const pool = require('../config/db');

// Get all units for a property
const getUnits = async (req, res) => {
  try {
    const { propertyId } = req.params;
    // Verify property belongs to landlord
    const [prop] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [propertyId, req.user.id]
    );
    if (prop.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const [rows] = await pool.query(
      `SELECT u.*, 
        (SELECT t.name FROM leases l JOIN tenants t ON l.tenant_id = t.tenant_id 
         WHERE l.unit_id = u.unit_id AND l.status = 'Active' LIMIT 1) as tenant_name
      FROM units u WHERE u.property_id = ? ORDER BY u.unit_number`,
      [propertyId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get units error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create unit
const createUnit = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { unit_number, meter_number, floor, bedrooms, bathrooms, area_sqft, rent_amount } = req.body;

    if (!unit_number || !rent_amount) {
      return res.status(400).json({ success: false, message: 'Unit number and rent amount are required.' });
    }

    // Verify property belongs to landlord
    const [prop] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [propertyId, req.user.id]
    );
    if (prop.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO units (property_id, unit_number, meter_number, floor, bedrooms, bathrooms, area_sqft, rent_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [propertyId, unit_number, meter_number || null, floor || null, bedrooms || 1, bathrooms || 1, area_sqft || null, rent_amount]
    );

    const [newUnit] = await pool.query('SELECT * FROM units WHERE unit_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newUnit[0] });
  } catch (err) {
    console.error('Create unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update unit
const updateUnit = async (req, res) => {
  try {
    const { unit_number, meter_number, floor, bedrooms, bathrooms, area_sqft, rent_amount, status } = req.body;
    
    // Verify unit belongs to landlord's property
    const [existing] = await pool.query(
      `SELECT u.* FROM units u JOIN properties p ON u.property_id = p.property_id 
       WHERE u.unit_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE units SET unit_number = ?, meter_number = ?, floor = ?, bedrooms = ?, bathrooms = ?, area_sqft = ?, rent_amount = ?, status = ? WHERE unit_id = ?',
      [
        unit_number || current.unit_number,
        meter_number !== undefined ? meter_number : current.meter_number,
        floor !== undefined ? floor : current.floor,
        bedrooms || current.bedrooms,
        bathrooms || current.bathrooms,
        area_sqft !== undefined ? area_sqft : current.area_sqft,
        rent_amount || current.rent_amount,
        status || current.status,
        req.params.id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM units WHERE unit_id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('Update unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete unit
const deleteUnit = async (req, res) => {
  try {
    const [existing] = await pool.query(
      `SELECT u.* FROM units u JOIN properties p ON u.property_id = p.property_id 
       WHERE u.unit_id = ? AND p.landlord_id = ?`,
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    // Check for active leases
    const [leases] = await pool.query(
      "SELECT COUNT(*) as count FROM leases WHERE unit_id = ? AND status = 'Active'",
      [req.params.id]
    );
    if (leases[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete unit with active lease.' });
    }

    await pool.query('DELETE FROM units WHERE unit_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Unit deleted successfully.' });
  } catch (err) {
    console.error('Delete unit error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getUnits, createUnit, updateUnit, deleteUnit };
