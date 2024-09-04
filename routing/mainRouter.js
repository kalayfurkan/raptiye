const express = require('express');
const router = express.Router();




const getRequest=require('./get');
router.use('/',getRequest);
const loginRegister=require('./LoginRegister.js');
router.use('/',loginRegister);
const ilan=require('./ilan.js');
router.use('/',ilan);

module.exports = router;