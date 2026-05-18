const express = require('express');
const router = express.Router();
const {
  getBrowseProperties,
  getBrowsePropertyDetail,
  createBooking,
  getMyBookings,
  cancelBooking,
  getLandlordBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ── Tenant routes ──
router.get('/browse',       verifyToken, authorizeRoles('Tenant'), getBrowseProperties);
router.get('/browse/:id',   verifyToken, authorizeRoles('Tenant'), getBrowsePropertyDetail);
router.post('/',            verifyToken, authorizeRoles('Tenant'), createBooking);
router.get('/my-bookings',  verifyToken, authorizeRoles('Tenant'), getMyBookings);
router.put('/cancel/:id',   verifyToken, authorizeRoles('Tenant'), cancelBooking);

// ── Landlord routes ──
router.get('/landlord',           verifyToken, authorizeRoles('Landlord'), getLandlordBookings);
router.put('/landlord/:id',       verifyToken, authorizeRoles('Landlord'), updateBookingStatus);

module.exports = router;
