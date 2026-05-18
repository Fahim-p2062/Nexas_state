const express = require('express');
const router = express.Router();
const { getExpenses, createExpense } = require('../controllers/expenseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('Landlord'));

router.get('/', getExpenses);
router.post('/', createExpense);

module.exports = router;
