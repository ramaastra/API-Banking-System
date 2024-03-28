const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'successfully connected to server',
    data: null
  });
});

module.exports = router;
