const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

//middle ware
app.use(cors());
app.use(express.json());





app.get('/', (req, res) => {
    res.send('Tools manufacturer !')
})

app.listen(port, () => {
    console.log(`Manufacturer app listening on port ${port}`)
})
