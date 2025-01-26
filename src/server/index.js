const express = require('express');

const { logsRouter } = require('./routes/logRoutes');

const app = express();
const port = 5000;

app.get('/', (req, res) => res.send('Hello World!'));
app.use('/logs', logsRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
