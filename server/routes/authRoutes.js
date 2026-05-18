const express = require('express');
const router = express.Router();
const { registerLandlord, registerTenant, login } = require('../controllers/authController');

router.post('/register-landlord', registerLandlord);
router.post('/register-tenant', registerTenant);
router.post('/login', login);

module.exports = router;
