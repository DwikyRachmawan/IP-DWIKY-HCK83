const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const GoogleAuthController = require('../controllers/googleAuthController');
const authentication = require('../middlewares/authentication');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google-login', GoogleAuthController.googleLogin);


// Protected routes
router.get('/profile', authentication, AuthController.getProfile);
router.put('/profile', authentication, AuthController.updateProfile);
router.delete('/profile', authentication, AuthController.deleteProfile);

module.exports = router;
