const express = require('express');
const router = express.Router();
const Kiraoda = require('../models/kiraodaSchema.js');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const allMiddlewares = require('../middlewares.js');
const User = require('../models/userSchema');

router.get('/addkiraoda', allMiddlewares.requireAuth, (req, res) => {
	res.render('addkiraoda');
})

router.post('/addkiraoda', allMiddlewares.requireAuth, async (req, res) => {
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
		req.session.sessionFlash = {
			type: 'alert alert-success',
			message: 'İlanınız başarılı bir şekilde oluşturuldu'
		}

		res.redirect('/kiraoda');
	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}
})

router.get('/kiraoda', allMiddlewares.requireAuth, async (req, res) => {
	const kiraodalar = await Kiraoda.find({});
	const currentUser = await User.findById(req.session.userId);
	res.render('kiraodalar', { ilanlar: kiraodalar, currentUser })
})

router.get('/kiraoda/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraid);
	const owner = await User.findById(kira.owner);
	res.render('kiraodadetay', { ilan: kira, owner });
})

router.get('/kiraoda/edit/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraid);

	res.render('kiraodaedit', { kira, kiraid });
})

router.post('/kiraoda/edit/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraid);

	let images = req.files?.images;

	if (images) {
		if (!Array.isArray(images)) {
			images = [images];
		}

		const maxWidth = 600;
		const quality = 50;

		for (let element of images) {
			const date = new Date().toISOString().replace(/:/g, '-');
			const imagePath = path.resolve(__dirname, '../public/img/kiraodaimages', date + element.name);
			kira.images.push(`/img/kiraodaimages/${date + element.name}`);

			try {
				await sharp(element.data)
					.resize(maxWidth)
					.jpeg({ quality: quality })
					.toFile(imagePath);
			} catch (error) {
				return res.status(500).send('Resim işlenirken hata oluştu.');
			}
		}
	}

	const updatedData = {
		title: req.body.title,
		searchingFor: req.body.searchingFor,
		reachYou: req.body.reachYou,
		description: req.body.description,
		images: kira.images,
	};

	try {
		await Kiraoda.updateOne(
			{ _id: kiraid },
			{ $set: updatedData }
		);
		res.redirect('/profile');
	} catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})

router.post('/delete-kiraodaimage/:kiraid/:index', allMiddlewares.requireAuth, async (req, res) => {
	const kiraid = req.params.kiraid;
	const kira = await Kiraoda.findById(kiraid);

	const index = req.params.index;
	const imageToDelete = path.join(__dirname, '../public', kira.images[index]);

	fs.unlinkSync(imageToDelete);
	await Kiraoda.updateOne(
		{ _id: kiraid },
		{ $pull: { images: kira.images[index] } } // Görseli diziden çıkarın
	);

	res.redirect(`/kiraoda/edit/${kiraid}`);

})


router.post('/kiraoda/delete/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraodaid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraodaid);

	if (!kira) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (kira.images.length > 0) {
		for (const address of kira.images) {
			const fullImagePath = path.join(__dirname, '../public', address);
			try {
				fs.unlinkSync(fullImagePath);
				console.log(`Image deleted: ${fullImagePath}`);
			} catch (error) {
				console.error(`Failed to delete image: ${fullImagePath}`, error);
			}
		}
	}

	try {
		await Kiraoda.deleteOne({ _id: kiraodaid });

		await User.updateMany(
			{ favoritesKira: kiraodaid },
			{ $pull: { favoritesKira: kiraodaid } }
		);

		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu.');
	}
})


router.post('/kiraaddfavorites/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	const favoriteid = req.params.ilanid;
	const userId = req.session.userId;

	try {
		const user = await User.findById(userId);
		if (!user.favoritesKira.includes(favoriteid)) {
			user.favoritesKira.push(favoriteid);
			await user.save();
		}
		res.json({ success: true, message: 'Favorilere eklendi' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Sunucu hatası');
	}
})

router.post('/kiradeletefavorites/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	const favoriteid = req.params.ilanid;
	const userId = req.session.userId;


	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
		}

		user.favoritesKira = user.favoritesKira.filter(fav => fav.toString() !== favoriteid);
		await user.save();
		res.json({ success: true, message: 'Favorilerden silindi' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Sunucu hatası');
	}
})


module.exports = router;