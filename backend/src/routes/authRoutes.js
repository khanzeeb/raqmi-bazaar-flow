const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', registerValidator, AuthController.register);
router.post('/login', loginValidator, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', updateProfileValidator, AuthController.updateProfile);
router.put('/change-password', changePasswordValidator, AuthController.changePassword);

module.exports = router;