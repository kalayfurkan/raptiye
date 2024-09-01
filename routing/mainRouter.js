const express = require('express');
const router = express.Router();




const getRequest=require('./get');
router.use('/',getRequest);
const postLoginRegister=require('./postLoginRegister');
router.use('/',postLoginRegister);


module.exports = router;