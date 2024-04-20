const { Router } = require('express');
const router = Router();
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const accountRouter = require('./account.router');
const transactionRouter = require('./transaction.router');
const auth = require('../../middlewares/auth.middleware');
const fs = require('fs');
const yaml = require('yaml');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const apiDocYaml = fs.readFileSync(
  path.resolve(__dirname, '../../docs/v1.yml'),
  'utf-8'
);
const apiDocs = yaml.parse(apiDocYaml);

router.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

router.use('/auth', authRouter);
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
