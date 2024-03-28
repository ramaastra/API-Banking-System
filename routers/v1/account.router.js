const { Router } = require('express');
const accountController = require('../../controllers/v1/account.controller');
const router = Router();

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', accountController.create);

module.exports = router;
