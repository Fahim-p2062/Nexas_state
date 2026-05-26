const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest } = require('../controllers/maintenanceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getMaintenanceRequests);
router.post('/', authorizeRoles('Tenant'), createMaintenanceRequest);
router.put('/:id', authorizeRoles('Landlord', 'Staff'), updateMaintenanceRequest);
router.delete('/:id', authorizeRoles('Landlord', 'Staff'), deleteMaintenanceRequest);

module.exports = router;
