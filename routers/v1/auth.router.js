const { Router } = require('express');
const authController = require('../../controllers/v1/auth.controller');
const restrict = require('../../middlewares/restrict.middleware');
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/authenticate', restrict, authController.authenticate);

module.exports = router;
