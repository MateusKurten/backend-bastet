const express = require('express')
const cors = require('cors');
const app = express();

const port = 3333;
const hostname = '127.0.0.1';

app.use(cors("http://localhost"));
app.use(express.json());

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})
