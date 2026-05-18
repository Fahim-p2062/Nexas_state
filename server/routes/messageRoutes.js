const express = require('express');
const router = express.Router();
const { getMessages, getConversations, sendMessage } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/conversations', getConversations);
router.get('/', getMessages);
router.post('/', sendMessage);

module.exports = router;
