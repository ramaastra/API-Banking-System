const { Router } = require('express');
const router = Router();
const userRouter = require('./user.router');
const accountRouter = require('./account.router');

router.use('/users', userRouter);
router.use('/accounts', accountRouter);

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'successfully connected to server',
    data: null
  });
});

module.exports = router;
