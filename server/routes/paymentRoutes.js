const express = require('express');
const router = express.Router();
const { getPayments, getPaymentById, createPayment, updatePayment, getOverduePayments } = require('../controllers/paymentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/overdue', authorizeRoles('Landlord'), getOverduePayments);
router.get('/', authorizeRoles('Landlord'), getPayments);
router.post('/', authorizeRoles('Landlord'), createPayment);
router.get('/:id', authorizeRoles('Landlord'), getPaymentById);
router.put('/:id', authorizeRoles('Landlord'), updatePayment);

module.exports = router;
