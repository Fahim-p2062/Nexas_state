const pool = require('../config/db');
const path = require('path');
const multer = require('multer');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images and documents are allowed.'));
  }
});

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const { lease_id, property_id, type } = req.body;
    if (!lease_id || !req.file) {
      return res.status(400).json({ success: false, message: 'Lease ID and file are required.' });
    }

    // Access check:
    // - Tenant can upload only to their own lease
    // - Landlord can upload only to leases on their own properties
    // - Admin can upload anywhere
    let resolvedPropertyId = property_id || null;

    if (req.user.role === 'Tenant') {
      const [lease] = await pool.query('SELECT lease_id FROM leases WHERE lease_id = ? AND tenant_id = ?', [lease_id, req.user.id]);
      if (lease.length === 0) return res.status(403).json({ success: false, message: 'Access forbidden.' });
    } else if (req.user.role === 'Landlord') {
      const [lease] = await pool.query(
        `SELECT l.lease_id, p.property_id
        FROM leases l
        JOIN units u ON l.unit_id = u.unit_id
        JOIN properties p ON u.property_id = p.property_id
        WHERE l.lease_id = ? AND p.landlord_id = ?`,
        [lease_id, req.user.id]
      );
      if (lease.length === 0) return res.status(403).json({ success: false, message: 'Access forbidden.' });
      // Auto-resolve property_id from the lease's unit if not provided
      if (!resolvedPropertyId) resolvedPropertyId = lease[0].property_id;
    }

    const file_url = `/uploads/${req.file.filename}`;
    const file_name = req.file.originalname;
    const uploaded_by_role = req.user.role === 'Tenant' ? 'Tenant' : 'Landlord';

    const [result] = await pool.query(
      'INSERT INTO documents (lease_id, property_id, file_url, file_name, type, uploaded_by_role) VALUES (?, ?, ?, ?, ?, ?)',
      [lease_id, resolvedPropertyId, file_url, file_name, type || 'Other', uploaded_by_role]
    );

    const [newDoc] = await pool.query('SELECT * FROM documents WHERE document_id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newDoc[0] });
  } catch (err) {
    console.error('Upload document error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get documents by lease
const getDocuments = async (req, res) => {
  try {
    const { leaseId, propertyId } = req.query;
    let query = `
      SELECT d.*, p.name as property_name
      FROM documents d
      JOIN leases l ON d.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'Tenant') {
      query += ' AND l.tenant_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'Landlord') {
      query += ' AND p.landlord_id = ?';
      params.push(req.user.id);
    }

    if (leaseId) {
      query += ' AND d.lease_id = ?';
      params.push(leaseId);
    }

    if (propertyId) {
      query += ' AND d.property_id = ?';
      params.push(propertyId);
    }

    query += ' ORDER BY d.uploaded_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { upload, uploadDocument, getDocuments };
