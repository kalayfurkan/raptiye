const express = require('express');
const router = express.Router();




const getRequest=require('./get');
router.use('/',getRequest);
const loginRegister=require('./LoginRegister.js');
router.use('/',loginRegister);
const ilan=require('./ilan.js');
router.use('/',ilan);
const profile=require('./profile');
router.use(profile);
const job=require('./job');
router.use('/',job);
const kiraoda=require('./kiraoda');
router.use('/',kiraoda);
const kampuseBirMesaj=require('./kampusebirmesaj.js');
router.use('/',kampuseBirMesaj);

module.exports = router;