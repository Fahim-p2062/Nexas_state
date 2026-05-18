const express = require('express');
const router = express.Router();
const { getTenantDashboard } = require('../controllers/tenantPortalController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, authorizeRoles('Tenant'), getTenantDashboard);

module.exports = router;
