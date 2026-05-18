const express = require('express');
const router = express.Router();
const { getLeases, getLeaseById, createLease, updateLeaseStatus } = require('../controllers/leaseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', authorizeRoles('Landlord'), getLeases);
router.post('/', authorizeRoles('Landlord'), createLease);
router.get('/:id', authorizeRoles('Landlord'), getLeaseById);
router.put('/:id/status', authorizeRoles('Landlord'), updateLeaseStatus);

module.exports = router;
