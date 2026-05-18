const express = require('express');
const router = express.Router();
const { upload, uploadDocument, getDocuments } = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);

module.exports = router;
