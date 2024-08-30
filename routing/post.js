const express = require('express');
const router = express.Router();
const User=require('../models/user');


router.post('/register', async(req,res) => {
	try {
		const {password,username,email}=req.body;
		const allowedMail="@itu.edu.tr";
		if(!email.endsWith(allowedMail)){
			res.status(400).render('errorpage', { message: `You must use ${allowedMail} mail type` });
		}
		
		await User.create(req.body);
		res.end('lol');
		
	} catch (error) {
		res.status(400).render('errorpage');
	}
})





module.exports = router;