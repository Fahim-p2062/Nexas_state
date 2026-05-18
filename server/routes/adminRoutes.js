const express = require('express');
const router = express.Router();
const { 
  getAdminDashboard, getAllLandlords, getAllTenants, getAllProperties,
  getAllStaff, getAllObjections, getAllPayments, getAllMaintenance
} = require('../controllers/adminController');
const { getAuditLogs, getAdminAuditLogs } = require('../controllers/auditLogController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/landlords', getAllLandlords);
router.get('/tenants', getAllTenants);
router.get('/properties', getAllProperties);
router.get('/staff', getAllStaff);
router.get('/objections', getAllObjections);
router.get('/payments', getAllPayments);
router.get('/maintenance', getAllMaintenance);
router.get('/audit-logs', getAuditLogs);
router.get('/admin-audit-logs', getAdminAuditLogs);

module.exports = router;
