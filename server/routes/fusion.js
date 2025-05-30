const express = require('express');
const router = express.Router();
const FusionController = require('../controllers/FusionControllers');
const authentication = require('../middlewares/authentication');

// Semua endpoint memerlukan authentication
router.post('/', authentication, FusionController.createFusion); // Ubah dari /create ke /
router.get('/history', authentication, FusionController.getFusionHistory);

module.exports = router;
