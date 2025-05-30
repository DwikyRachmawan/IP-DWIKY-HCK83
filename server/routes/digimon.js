const express = require('express');
const router = express.Router();
const DigimonController = require('../controllers/DigimonControllers');

router.get('/', DigimonController.getAllDigimon);

module.exports = router;
