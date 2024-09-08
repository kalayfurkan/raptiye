const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Kampusemesaj=require('../models/kampusemesajSchema.js');
const User = require('../models/userSchema');

router.get('/kampusebirmesajbirak',allMiddlewares.requireAuth,(req, res) => {
	res.render('kampusebirmesajver');
})


router.post('/kampusebirmesajbirak',allMiddlewares.requireAuth,async(req, res) => {
	try {
		const message=req.body.mesaj;
	let user;
	const isAnonim=!!req.body.anonim;

	if (isAnonim) {	
        user="Anonim"
    }else{
		const userid=await User.findById(req.session.userId);
		user=userid.username;
	}

	await Kampusemesaj.create({
		mesaj:message,
		owner:user,
	})
	res.redirect('/kampusebirmesajbirak');
	} catch (error) {
		res.status(400).send('bir şeyler yanlış gitti');
	}
	
})

router.get('/kampusemesajlar',allMiddlewares.requireAuth,async(req, res) => {	
	const messages=await Kampusemesaj.find({});

	res.render('kampusemesajlar',{messages});
})

// Upvote API
router.post('/kampusemesaj/upvote/:id', allMiddlewares.requireAuth, async (req, res) => {
    try {
        await Kampusemesaj.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } });
        res.status(200).send('Upvote başarıyla eklendi.');
    } catch (error) {
        res.status(500).send('Upvote işlemi sırasında bir hata oluştu.');
    }
});

// Downvote API
router.post('/kampusemesaj/downvote/:id', allMiddlewares.requireAuth, async (req, res) => {
    try {
        await Kampusemesaj.findByIdAndUpdate(req.params.id, { $inc: { downvotes: 1 } });
        res.status(200).send('Downvote başarıyla eklendi.');
    } catch (error) {
        res.status(500).send('Downvote işlemi sırasında bir hata oluştu.');
    }
});
module.exports = router;