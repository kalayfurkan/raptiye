const express = require('express');
const router = express.Router();




const getRequest=require('./get');
router.use('/',getRequest);
const postRequest=require('./postLoginRegister');
router.use('/',postRequest);


module.exports = router;