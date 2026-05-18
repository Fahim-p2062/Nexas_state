const pool = require('../config/db');

// Get all properties for the logged-in landlord
const getProperties = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM units WHERE property_id = p.property_id) as unit_count,
        (SELECT COUNT(*) FROM units WHERE property_id = p.property_id AND status = 'Vacant') as vacant_count,
        (SELECT COUNT(*) FROM units WHERE property_id = p.property_id AND status = 'Occupied') as occupied_count
      FROM properties p WHERE p.landlord_id = ? ORDER BY p.created_at DESC`,
      [landlordId]
    );

    // Attach amenities for each property
    for (const prop of rows) {
      const [amenities] = await pool.query(
        `SELECT a.amenity_id, a.name FROM amenities a 
         JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
         WHERE pa.property_id = ?`,
        [prop.property_id]
      );
      prop.amenities = amenities;
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single property
const getPropertyById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Get amenities
    const [amenities] = await pool.query(
      `SELECT a.amenity_id, a.name FROM amenities a 
       JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
       WHERE pa.property_id = ?`,
      [req.params.id]
    );

    // Get units
    const [units] = await pool.query(
      'SELECT * FROM units WHERE property_id = ? ORDER BY unit_number',
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], amenities, units } });
  } catch (err) {
    console.error('Get property error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Create property
const createProperty = async (req, res) => {
  try {
    const { name, address, city, type, description, amenity_ids } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: 'Address is required.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO properties (landlord_id, name, address, city, type, description) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, name || null, address, city || null, type || 'Residential', description || null]
      );

      // Add amenities if provided
      if (amenity_ids && Array.isArray(amenity_ids) && amenity_ids.length > 0) {
        const values = amenity_ids.map(aid => [result.insertId, aid]);
        await connection.query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ?',
          [values]
        );
      }

      await connection.commit();

      const [newProp] = await pool.query('SELECT * FROM properties WHERE property_id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newProp[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { name, address, city, type, amenity_ids } = req.body;
    const [existing] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE properties SET name = ?, address = ?, city = ?, type = ? WHERE property_id = ?',
        [name || existing[0].name, address || existing[0].address, city || existing[0].city, type || existing[0].type, req.params.id]
      );

      // Update amenities if provided
      if (amenity_ids && Array.isArray(amenity_ids)) {
        await connection.query('DELETE FROM property_amenities WHERE property_id = ?', [req.params.id]);
        if (amenity_ids.length > 0) {
          const values = amenity_ids.map(aid => [req.params.id, aid]);
          await connection.query(
            'INSERT INTO property_amenities (property_id, amenity_id) VALUES ?',
            [values]
          );
        }
      }

      await connection.commit();

      const [updated] = await pool.query('SELECT * FROM properties WHERE property_id = ?', [req.params.id]);
      res.json({ success: true, data: updated[0] });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Update property error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM properties WHERE property_id = ? AND landlord_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    // Check for units
    const [units] = await pool.query('SELECT COUNT(*) as count FROM units WHERE property_id = ?', [req.params.id]);
    if (units[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete property with existing units. Remove units first.' });
    }
    // Clean up amenity links
    await pool.query('DELETE FROM property_amenities WHERE property_id = ?', [req.params.id]);
    await pool.query('DELETE FROM properties WHERE property_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (err) {
    console.error('Delete property error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all amenities
const getAmenities = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM amenities ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get amenities error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getAmenities };
