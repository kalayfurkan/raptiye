const express = require('express');
const router = express.Router();
const Kiraoda = require('../models/kiraodaSchema.js');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const allMiddlewares = require('../middlewares.js');

router.get('/addkiraoda',allMiddlewares.requireAuth,(req,res) => {
	res.render('addkiraoda');
})

router.post('/addkiraoda',allMiddlewares.requireAuth,async(req,res) => {
	try {
		let images = req.files?.images || [];  // Görsellerin olup olmadığını kontrol ediyoruz
		let imagePaths = [];

		if (!Array.isArray(images) && images) {
			images = [images];  // Tek bir görselse, bunu diziye dönüştürüyoruz
		}

		const maxWidth = 600;
		const quality = 50;

		for (let element of images) {
			const date = new Date().toISOString().replace(/:/g, '-');
			const imagePath = path.resolve(__dirname, '../public/img/kiraodaimages', date + element.name);
			imagePaths.push(`/img/kiraodaimages/${date + element.name}`);

			await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toFile(imagePath);
		}

		await Kiraoda.create({
			...req.body,
			images: imagePaths,
			owner: req.session.userId
		})

		res.redirect('/');
	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}
})

router.get('/kiraoda',allMiddlewares.requireAuth,async(req,res) => {
	const kiraodalar=await Kiraoda.find({});
	res.render('kiraodalar',{ilanlar:kiraodalar})
})
module.exports = router;