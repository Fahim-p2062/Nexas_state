const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/me', getMyNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
