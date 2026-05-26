const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, getStaffMeStats } = require('../controllers/staffController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Staff specific route
router.get('/me/stats', verifyToken, authorizeRoles('Staff'), getStaffMeStats);

// Landlord specific routes
router.use(verifyToken, authorizeRoles('Landlord'));
router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);

module.exports = router;
