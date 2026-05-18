const express = require('express');
const router = express.Router();
const { getPublicProperties, getPublicPropertyDetail } = require('../controllers/publicController');

// No auth required — these are public endpoints for visitors
router.get('/properties', getPublicProperties);
router.get('/properties/:id', getPublicPropertyDetail);

module.exports = router;
