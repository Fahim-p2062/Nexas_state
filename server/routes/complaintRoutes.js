const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createComplaint, getComplaints, updateComplaint } = require('../controllers/complaintController');

router.use(verifyToken);

// Tenant submits objections
router.post('/', authorizeRoles('Tenant'), createComplaint);

// Tenant sees their own; Landlord sees their own portfolio; Admin sees all
router.get('/', authorizeRoles('Tenant', 'Landlord', 'Admin'), getComplaints);

// Admin resolves/updates
router.put('/:id', authorizeRoles('Admin'), updateComplaint);

module.exports = router;

