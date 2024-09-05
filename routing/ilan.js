const express = require('express');
const router = express.Router();
const Ilan = require('../models/ilanSchema.js');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');
const allMiddlewares=require('../middlewares.js');

router.post('/addpost', async (req, res) => {
	try {
		let images = req.files.images;
		let imagePaths = [];

		if (!Array.isArray(images)) {
			images = [images];
		}

		const maxWidth = 600;
		const quality = 50;

		for (let element of images) {
			const date = new Date().toISOString().replace(/:/g, '-');
			const imagePath = path.resolve(__dirname, '../public/img/postimages', date + element.name);
			imagePaths.push(`/img/postimages/${date + element.name}`);

			await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toFile(imagePath);
		}

		await Ilan.create({
			...req.body,
			images: imagePaths,
			owner: req.session.userId
		})

		res.redirect('/');
	} catch (error) {
		res.render('errorpage',{message:"Bir hata oluştu"+error});
	}

});


router.get('/ilanlar',allMiddlewares.requireAuth,async (req, res) => {
	try {
		const allPosts=await Ilan.find({});
		res.render('ilanlar',{ilanlar:allPosts});
	} catch (error) {
		res.send(error);
	}
});

router.get('/ilan/:ilanid',allMiddlewares.requireAuth,async (req, res) => {
	try {
		const ilanId = req.params.ilanid;
    	const ilan = await Ilan.findById(ilanId);
		
		res.render('ilandetay',{ilan});

	} catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})

module.exports = router;