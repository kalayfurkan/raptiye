const express = require('express');
const router = express.Router();
const User=require('../models/user');
const bcrypt=require('bcrypt');

router.post('/register', async(req,res) => {
	try {
		const {password,username,email}=req.body;
		const allowedMail="@itu.edu.tr";
		if(!email.endsWith(allowedMail)){
			return res.status(400).render('errorpage', { message: `You must use ${allowedMail} mail type` });
		}
		await User.create(req.body);
		res.end('Başarıyla kayıt oldunuz mailinize gelen doğrulamayı kontrol edin');
		
	} catch (error) {
		res.status(400).render('errorpage',{message:"@itu.edu.tr uzantılı bir mail ile kaydolmadınız ya da kullanıcı adınız başka bir kullanıcı tarafından alınmış."});
	}
})

router.post('/login',async (req,res) => {
	try {
		const {email,password}=req.body;

		const user=await User.findOne({email});

		if(user){
			const same=await bcrypt.compare(password,user.password);
			if(same){
				res.status(200).send("You are logged in");
			}else{
				res.status(401).render('errorpage',{message:"Şifrenizi yanlış girdiniz"});
			}
		}
		else{
			return res.status(401).render('errorpage',{message:"Sistemde kayıtlı mail adresi bulunamamıştır"});
		}

		
	} catch (error) {
		res.status(500).send(error);
	}
	
	
})




module.exports = router;