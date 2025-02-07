const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Shortilan = require('../models/shortTermilanSchema.js');
const User = require('../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { uploadToR2, getLoadURL, deleteFromR2 } = require('./s3.js');


router.get('/kisasureliilanekle', allMiddlewares.requireAuth, (req, res) => {
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

	const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];

	for (let element of images) {
		const fileExtension = path.extname(element.name).toLowerCase();
		if (!allowedExtensions.includes(fileExtension)) {
			return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg dosyalarına izin verilmektedir.');
		}

		const date = new Date().toISOString().replace(/:/g, '-');
		const fileName = `${date}-${element.name}`;

		const compressedBuffer = await sharp(element.data)
			.resize(maxWidth)
			.jpeg({ quality: quality })
			.toBuffer();

		// Upload to Cloudflare R2
		try {
			await uploadToR2(compressedBuffer, fileName, element.mimetype, "kisa-ilan");
			imagePaths.push(fileName); // Store the filename in the array
		} catch (uploadError) {
			console.error("Error uploading to R2:", uploadError);
			return res.status(500).send("Dosya yüklenirken bir hata oluştu.");
		}
	}

	await Shortilan.create({
		title,
		description,
		removalDate,
		images: imagePaths,
		owner: req.session.userId,
	})
	req.session.sessionFlash = {
		type: 'alert alert-success',
		message: 'İlanınız başarılı bir şekilde oluşturuldu'
	}

	res.redirect('/kisasureliilanlar');
})

router.get('/kisasureliilanlar', allMiddlewares.requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Varsayılan sayfa: 1
        const limit = 8; // Sayfa başına 9 öğe
        const skip = (page - 1) * limit;

        // Veritabanından ilanları getirme ve pagination uygulama
        const kisaIlanlar = await Shortilan.find({})
            .populate('owner') // owner alanını doldur
            .sort({ createdAt: -1 }) // En yeni olanları önce getir
            .skip(skip) // Belirli sayıda öğe atla
            .limit(limit) // Belirli sayıda öğe al
            .exec();

        // Toplam ilan sayısını bulma
        const totalPosts = await Shortilan.countDocuments();
        const totalPages = Math.ceil(totalPosts / limit); // Toplam sayfa sayısını hesapla

        const currentUserid = req.session.userId;

        // Verileri render et
        res.render('kisailanlar', {
            ilanlar: await Promise.all(kisaIlanlar.map(async ilan => {
                return {
                    ...ilan.toObject(),
                    images: await Promise.all(ilan.images.map(async imageName => await getLoadURL(imageName, "kisa-ilan")))
                }
            })),
            currentUserid,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (error) {
        res.send(error); // Hata durumunda hata mesajını gönder
    }
});


router.post('/shortilan/delete/:shortid', allMiddlewares.requireAuth, async (req, res) => {
	const shortid = req.params.shortid;
	const shortpost = await Shortilan.findById(shortid);

	if (!shortpost) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (shortpost.images.length > 0) {
		for (const fileName of shortpost.images) {
			try {
				await deleteFromR2(fileName, "kisa-ilan");
				console.log(`Image deleted from R2: ${fileName}`);
			} catch (error) {
				console.error(`Failed to delete image from R2: ${fileName}`, error);
			}
		}
	}

	try {
		await Shortilan.deleteOne({ _id: shortid });
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu.');
	}
})
module.exports = router;