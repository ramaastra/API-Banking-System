const { Router } = require('express');
const authController = require('../../controllers/v1/auth.controller');
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/authenticate', authController.authenticate);

module.exports = router;
