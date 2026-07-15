const express = require('express');

const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.get('/users', authenticate, authorize('admin'), authController.listUsers);
router.post('/users', authenticate, authorize('admin'), authController.register);

module.exports = router;
