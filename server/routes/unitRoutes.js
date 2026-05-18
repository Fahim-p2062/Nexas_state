const express = require('express');
const router = express.Router();
const { getUnits, createUnit, updateUnit, deleteUnit } = require('../controllers/unitController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Landlord'));

router.get('/property/:propertyId', getUnits);
router.post('/property/:propertyId', createUnit);
router.put('/:id', updateUnit);
router.delete('/:id', deleteUnit);

module.exports = router;
