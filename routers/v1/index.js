const { Router } = require('express');
const router = Router();
const userRouter = require('./user.router');
const accountRouter = require('./account.router');
const transactionRouter = require('./transaction.router');
const auth = require('../../middlewares/auth.middleware');

router.use('/users', auth, userRouter);
router.use('/accounts', auth, accountRouter);
router.use('/transactions', auth, transactionRouter);

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'successfully connected to server',
    data: null
  });
});

module.exports = router;
