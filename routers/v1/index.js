const { Router } = require('express');
const router = Router();
const userRouter = require('./user.router');
const accountRouter = require('./account.router');
const transactionRouter = require('./transaction.router');

router.use('/users', userRouter);
router.use('/accounts', accountRouter);
router.use('/transactions', transactionRouter);

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'successfully connected to server',
    data: null
  });
});

module.exports = router;
