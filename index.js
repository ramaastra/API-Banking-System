require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routerV1 = require('./routers/v1');
const app = express();
const port = 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', routerV1);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
  });
}

module.exports = app;
