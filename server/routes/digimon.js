const express = require('express');
const router = express.Router();
const DigimonController = require('../controllers/DigimonController');

router.get('/', DigimonController.getAllDigimon);

module.exports = router;
