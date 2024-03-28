const express = require('express');
const morgan = require('morgan');
const routerV1 = require('./routers/v1');
const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', routerV1);

app.listen(port, () => {
  console.log(`Server is up and running on http://localhost:${port}`);
});
