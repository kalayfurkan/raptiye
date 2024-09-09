const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Shortilan = require('../models/shortTermilanSchema.js');
const User = require('../models/userSchema');
const path = require('path');
const sharp = require('sharp');

router.get('/addshortilan', allMiddlewares.requireAuth, (req, res) => {
	res.render('addshortilan')
})

router.post('/addshortilan', allMiddlewares.requireAuth, async (req, res) => {
	let images = req.files?.images || [];
	let imagePaths = [];

	if (!Array.isArray(images) && images) {
		images = [images];
	}

	const { title, duration, description } = req.body;

	const removalDate = new Date(Date.now() + duration * 60 * 60 * 1000); // 'duration' saat cinsinden

	const maxWidth = 600;
	const quality = 50;

	for (let element of images) {
		const date = new Date().toISOString().replace(/:/g, '-');
		const imagePath = path.resolve(__dirname, '../public/img/shortilanimages', date + element.name);
		imagePaths.push(`/img/shortilanimages/${date + element.name}`);

		await sharp(element.data)
			.resize(maxWidth)
			.jpeg({ quality: quality })
			.toFile(imagePath);
	}

	await Shortilan.create({
		title,
		description,
		removalDate,
		images: imagePaths,
		owner: req.session.userId,
	})

	res.redirect('/addshortilan');
})

router.get('/kisailanlar',allMiddlewares.requireAuth,async (req,res) => {
	const kisaIlanlar=await Shortilan.find({});

	res.render('kisailanlar',{ilanlar:kisaIlanlar});
})
module.exports = router;