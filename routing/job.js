const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');

router.get('/addjob',allMiddlewares.requireAuth,(req,res) => {
	res.render('addjob');
})

router.post('/addjob',allMiddlewares.requireAuth,(req,res) => {
	
})


module.exports = router;