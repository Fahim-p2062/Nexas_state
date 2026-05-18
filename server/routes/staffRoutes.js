const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff } = require('../controllers/staffController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Landlord'));

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);

module.exports = router;
