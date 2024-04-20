const { Router } = require('express');
const userController = require('../../controllers/v1/user.controller');
const router = Router();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);

module.exports = router;
