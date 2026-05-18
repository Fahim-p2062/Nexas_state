const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/me', getMyNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
