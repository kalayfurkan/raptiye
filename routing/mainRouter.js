const express = require('express');
const router = express.Router();




const getRequest=require('./get');
router.use('/',getRequest);

module.exports = router;