const { Router } = require('express');
const transactionController = require('../../controllers/v1/transaction.controller');
const router = Router();

router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getById);
router.post('/', transactionController.create);

module.exports = router;
