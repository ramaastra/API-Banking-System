const { Router } = require('express');
const router = Router();
const userRouter = require('./user.router');

router.use('/users', userRouter);

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'successfully connected to server',
    data: null
  });
});

module.exports = router;
