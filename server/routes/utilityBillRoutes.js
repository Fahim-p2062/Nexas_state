const express = require('express');
const router = express.Router();
const { getUtilityBills, getTenantUtilityBills, createUtilityBill, updateUtilityBill } = require('../controllers/utilityBillController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Tenant endpoint
router.get('/tenant', authorizeRoles('Tenant'), getTenantUtilityBills);

// Landlord endpoints
router.get('/', authorizeRoles('Landlord'), getUtilityBills);
router.post('/', authorizeRoles('Landlord'), createUtilityBill);
router.put('/:id', authorizeRoles('Landlord'), updateUtilityBill);

module.exports = router;
