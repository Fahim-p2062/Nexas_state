const express = require('express');
const router = express.Router();
const { getTenants, getTenantById, createTenant, updateTenant } = require('../controllers/tenantController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Landlord'));

router.get('/', getTenants);
router.post('/', createTenant);
router.get('/:id', getTenantById);
router.put('/:id', updateTenant);

module.exports = router;
