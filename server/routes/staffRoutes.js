const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, getStaffMeStats, getStaffStatsById } = require('../controllers/staffController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Staff specific route
router.get('/me/stats', verifyToken, authorizeRoles('Staff'), getStaffMeStats);

// Landlord specific routes
router.use(verifyToken, authorizeRoles('Landlord'));
router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.get('/:id/stats', getStaffStatsById);

module.exports = router;
