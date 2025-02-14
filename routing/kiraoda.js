const express = require('express');
const router = express.Router();
const Kiraoda = require('../models/kiraodaSchema.js');
const sharp = require('sharp');
const path = require('path');
const allMiddlewares = require('../middlewares.js');
const User = require('../models/userSchema');
const { uploadToR2, deleteFromR2 } = require('./s3.js');

router.get('/evarkadasiilaniekle', allMiddlewares.requireAuth, (req, res) => {
	res.render('addkiraoda');
})

router.post('/addkiraoda', allMiddlewares.requireAuth, async (req, res) => {
	try {
		let images = req.files?.images || [];  // Görsellerin olup olmadığını kontrol ediyoruz
		let imagePaths = [];

		if (!Array.isArray(images) && images) {
			images = [images];  // Tek bir görselse, bunu diziye dönüştürüyoruz
		}

		const maxWidth = 1920;
		const quality = 50;

		const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];

		for (let element of images) {
			const fileExtension = path.extname(element.name).toLowerCase();
			if (!allowedExtensions.includes(fileExtension)) {
				return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg dosyalarına izin verilmektedir.');
			}

			const date = new Date().toISOString().replace(/:/g, '-');
			const fileName = `${date}-${element.name.replace('/', '_')}`;

			const compressedBuffer = await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toBuffer();

			// Upload to Cloudflare R2
			try {
				await uploadToR2(compressedBuffer, fileName, element.mimetype, "ev-arkadasi");
				imagePaths.push(`/images/ev-arkadasi/${fileName}`); // Store the filename
			} catch (uploadError) {
				console.error("Error uploading to R2:", uploadError);
				return res.status(500).send("Dosya yüklenirken bir hata oluştu.");
			}
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

		res.redirect('/evarkadasiilanlari');
	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}
})

router.get('/evarkadasiilanlari', allMiddlewares.requireAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Varsayılan sayfa 1
    const limit = 8; // Sayfa başına 10 ilan
    const skip = (page - 1) * limit;

    try {
        // Kira odalarını veritabanından çek
        const kiraodalar = await Kiraoda.find({})
            .sort({ createdAt: -1 }) // En son oluşturulan ilanları önce göster
            .skip(skip) // Atlanacak öğeler
            .limit(limit); // Sayfa başına gösterilecek öğe sayısı

        // Toplam ilan sayısını al
        const totalKiraodalar = await Kiraoda.countDocuments();

        // Toplam sayfa sayısını hesapla
        const totalPages = Math.ceil(totalKiraodalar / limit);

        // Mevcut kullanıcıyı al
        const currentUser = await User.findById(req.session.userId);

        // Sayfayı render et
        res.render('kiraodalar', {
            ilanlar: kiraodalar,
            currentUser,
            pagination: {
                totalKiraodalar,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.get('/evarkadasiilani/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraid);
	const owner = await User.findById(kira.owner);
	const currentUserID=req.session.userId;


	res.render('kiraodadetay', { ilan: kira, owner,currentUserID });
})

router.get('/evarkadasiilani/edit/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
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

		const maxWidth = 1920;
		const quality = 50;
		const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];

		for (let element of images) {
			const fileExtension = path.extname(element.name).toLowerCase();
			if (!allowedExtensions.includes(fileExtension)) {
				return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg dosyalarına izin verilmektedir.');
			}

			const date = new Date().toISOString().replace(/:/g, '-');
			const fileName = `${date}-${element.name.replace('/', '_')}`;

			const compressedBuffer = await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toBuffer();

			// Upload to Cloudflare R2
			try {
				await uploadToR2(compressedBuffer, fileName, element.mimetype, "ev-arkadasi");
				kira.images.push(`/images/ev-arkadasi/${fileName}`); // Store the filename
			} catch (uploadError) {
				console.error("Error uploading to R2:", uploadError);
				return res.status(500).send("Dosya yüklenirken bir hata oluştu.");
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
	const fileNameToDelete = kira.images[index];

	try {
		await deleteFromR2(fileNameToDelete, "ev-arkadasi");
		await Kiraoda.updateOne(
			{ _id: kiraid },
			{ $pull: { images: fileNameToDelete } } // Remove the filename from the array
		);
		res.redirect(`/evarkadasiilani/edit/${kiraid}`);
	} catch (deleteError) {
		console.error("Error deleting from R2:", deleteError);
		return res.status(500).send("Dosya silinirken bir hata oluştu.");
	}

})


router.post('/kiraoda/delete/:kiraodaid', allMiddlewares.requireAuth, async (req, res) => {
	const kiraodaid = req.params.kiraodaid;
	const kira = await Kiraoda.findById(kiraodaid);

	if (!kira) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (kira.images.length > 0) {
		for (const fileName of kira.images) {
			try {
				await deleteFromR2(fileName, "ev-arkadasi");
			} catch (error) {
				console.error(`Failed to delete image from R2: ${fileName}`, error);
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