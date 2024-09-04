const express = require('express');
const router = express.Router();
const Ilan = require('../models/ilanSchema.js');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

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


module.exports = router;