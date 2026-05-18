const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getAmenities } = require('../controllers/propertyController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Landlord'));

router.get('/amenities', getAmenities);
router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;
