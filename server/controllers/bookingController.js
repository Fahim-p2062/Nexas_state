const pool = require('../config/db');

const getBrowseProperties = async (req, res) => {
  try {
    const { city, type, minRent, maxRent, search, bedrooms } = req.query;

    let query = `
      SELECT p.property_id, p.name AS property_name, p.address, p.city, p.type, p.description,
        l.name AS landlord_name, l.contact AS landlord_contact,
        COUNT(u.unit_id) AS total_units,
        SUM(CASE WHEN u.status = 'Vacant' THEN 1 ELSE 0 END) AS vacant_units,
        MIN(u.rent_amount) AS min_rent,
        MAX(u.rent_amount) AS max_rent,
        MIN(u.bedrooms) AS min_bedrooms,
        MAX(u.bedrooms) AS max_bedrooms
      FROM properties p
      JOIN landlords l ON p.landlord_id = l.landlord_id
      LEFT JOIN units u ON p.property_id = u.property_id
      WHERE 1=1`;
    const params = [];

    if (city)   { query += ' AND p.city LIKE ?';  params.push(`%${city}%`); }
    if (type)   { query += ' AND p.type = ?';      params.push(type); }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.address LIKE ? OR p.city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY p.property_id';

    if (minRent)   { query += ' HAVING min_rent >= ?';    params.push(parseFloat(minRent)); }
    if (maxRent)   { query += (minRent ? ' AND' : ' HAVING') + ' max_rent <= ?';    params.push(parseFloat(maxRent)); }
    if (bedrooms)  { query += (minRent || maxRent ? ' AND' : ' HAVING') + ' max_bedrooms >= ?'; params.push(parseInt(bedrooms)); }

    query += ' ORDER BY vacant_units DESC, p.created_at DESC';

    const [rows] = await pool.query(query, params);

    for (const prop of rows) {
      const [amenities] = await pool.query(
        `SELECT a.name FROM amenities a 
         JOIN property_amenities pa ON a.amenity_id = pa.amenity_id 
         WHERE pa.property_id = ?`,
        [prop.property_id]
      );
      prop.amenities = amenities.map(a => a.name);
    }

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Browse properties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getBrowsePropertyDetail = async (req, res) => {
  try {
    const [property] = await pool.query(
      `SELECT p.*, l.name AS landlord_name, l.contact AS landlord_contact
       FROM properties p
       JOIN landlords l ON p.landlord_id = l.landlord_id
       WHERE p.property_id = ?`,
      [req.params.id]
    );
    if (property.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const [units] = await pool.query(
      `SELECT unit_id, unit_number, floor, bedrooms, bathrooms, area_sqft, rent_amount, status
       FROM units WHERE property_id = ?
       ORDER BY status = 'Vacant' DESC, unit_number`,
      [req.params.id]
    );

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
    console.error('Browse property detail error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createBooking = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { property_id, unit_id, booking_type, message } = req.body;

    if (!property_id) {
      return res.status(400).json({ success: false, message: 'Property ID is required.' });
    }

    const [existing] = await pool.query(
      `SELECT booking_id FROM property_bookings 
       WHERE tenant_id = ? AND property_id = ? AND status = 'Pending'`,
      [tenantId, property_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have a pending booking for this property.' });
    }

    if (unit_id) {
      const [unit] = await pool.query(
        "SELECT unit_id FROM units WHERE unit_id = ? AND property_id = ? AND status = 'Vacant'",
        [unit_id, property_id]
      );
      if (unit.length === 0) {
        return res.status(400).json({ success: false, message: 'Selected unit is not available.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO property_bookings (tenant_id, property_id, unit_id, booking_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, property_id, unit_id || null, booking_type || 'Rent', message || null]
    );

    const [propOwner] = await pool.query(
      'SELECT landlord_id, name FROM properties WHERE property_id = ?',
      [property_id]
    );
    if (propOwner.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, user_role, message, type)
         VALUES (?, 'Landlord', ?, 'General')`,
        [
          propOwner[0].landlord_id,
          `New booking request: ${req.user.name} wants to ${booking_type || 'Rent'} a unit in ${propOwner[0].name}.`
        ]
      );
    }

    res.status(201).json({ success: true, message: 'Booking request submitted successfully!', data: { booking_id: result.insertId } });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const [rows] = await pool.query(
      `SELECT pb.*, p.name AS property_name, p.address, p.city, p.type,
              u.unit_number, u.rent_amount, u.bedrooms, u.bathrooms
       FROM property_bookings pb
       JOIN properties p ON pb.property_id = p.property_id
       LEFT JOIN units u ON pb.unit_id = u.unit_id
       WHERE pb.tenant_id = ?
       ORDER BY pb.created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const [existing] = await pool.query(
      "SELECT * FROM property_bookings WHERE booking_id = ? AND tenant_id = ? AND status = 'Pending'",
      [req.params.id, tenantId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled.' });
    }

    await pool.query(
      "UPDATE property_bookings SET status = 'Cancelled' WHERE booking_id = ?",
      [req.params.id]
    );
    res.json({ success: true, message: 'Booking cancelled.' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const [rows] = await pool.query(
      `SELECT pb.*, p.name AS property_name, p.address,
              t.name AS tenant_name, t.email AS tenant_email, t.phone AS tenant_phone,
              u.unit_number, u.rent_amount
       FROM property_bookings pb
       JOIN properties p ON pb.property_id = p.property_id
       JOIN tenants t ON pb.tenant_id = t.tenant_id
       LEFT JOIN units u ON pb.unit_id = u.unit_id
       WHERE p.landlord_id = ?
       ORDER BY pb.created_at DESC`,
      [landlordId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get landlord bookings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected.' });
    }

    const [booking] = await pool.query(
      `SELECT pb.*, p.landlord_id, u.rent_amount FROM property_bookings pb
       JOIN properties p ON pb.property_id = p.property_id
       LEFT JOIN units u ON pb.unit_id = u.unit_id
       WHERE pb.booking_id = ? AND p.landlord_id = ?`,
      [req.params.id, landlordId]
    );
    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    await pool.query(
      "UPDATE property_bookings SET status = ?, reviewed_at = NOW() WHERE booking_id = ?",
      [status, req.params.id]
    );

    // If approved and unit exists, create the lease and mark unit occupied
    if (status === 'Approved' && booking[0].unit_id) {
      const rent = booking[0].rent_amount || 0;
      const securityDeposit = rent * 2;
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      await pool.query(
        `INSERT INTO leases (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
        [booking[0].unit_id, booking[0].tenant_id, startDate, endDate, rent, securityDeposit]
      );

      await pool.query(
        "UPDATE units SET status = 'Occupied' WHERE unit_id = ?",
        [booking[0].unit_id]
      );
    }

    await pool.query(
      `INSERT INTO notifications (user_id, user_role, message, type)
       VALUES (?, 'Tenant', ?, 'General')`,
      [
        booking[0].tenant_id,
        `Your booking request has been ${status.toLowerCase()}.`
      ]
    );

    res.json({ success: true, message: `Booking ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getBrowseProperties,
  getBrowsePropertyDetail,
  createBooking,
  getMyBookings,
  cancelBooking,
  getLandlordBookings,
  updateBookingStatus
};
