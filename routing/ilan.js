const express = require('express');
const router = express.Router();
const Ilan = require('../models/ilanSchema.js');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const allMiddlewares = require('../middlewares.js');
const User = require('../models/userSchema');


router.get('/satisilaniekle', allMiddlewares.requireAuth, (req, res) => {
	res.render('addpost');
});

router.post('/addpost',allMiddlewares.requireAuth, async (req, res) => {
	try {
		let images = req.files?.images || [];
		let imagePaths = [];

		if (!Array.isArray(images) && images) {
			images = [images];
		}

		const maxWidth = 1920;
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
		req.session.sessionFlash = {
			type: 'alert alert-success',
			message: 'İlanınız başarılı bir şekilde oluşturuldu'
		}


		res.redirect('/satisilanlari');


	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}

});


router.get('/satisilanlari', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; // Varsayılan sayfa: 1
    	const limit = 9; // Sayfa başına 10 öğe
    	const skip = (page - 1) * limit;

		const allPosts = await Ilan.find({})
			.populate('owner', 'username')
			.sort({createdAt:-1})
			.skip(skip)
			.limit(limit)
			.exec();
		const totalPosts = await Ilan.countDocuments();
		const totalPages = Math.ceil(totalPosts / limit);

		const currentUser = await User.findById(req.session.userId);


		res.render('ilanlar', {
            ilanlar: allPosts,
            currentUser,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
	} catch (error) {
		res.send(error);
	}
});

router.get('/satisilani/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const ilanId = req.params.ilanid;
		const ilan = await Ilan.findById(ilanId);
		const user = await User.findById(ilan.owner);
		const currentUserId=req.session.userId;
		res.render('ilandetay', { ilan, user,currentUserId });

	} catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})


router.get('/satisilani/edit/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const ilanId = req.params.ilanid;
		const ilan = await Ilan.findById(ilanId);

		res.render('editpost', { ilan, ilanId: ilanId });
	}
	catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})

router.post('/delete-image/:ilanid/:index', allMiddlewares.requireAuth, async (req, res) => {
	const ilanId = req.params.ilanid;
	const ilan = await Ilan.findById(ilanId);

	const index = req.params.index;
	const imageToDelete = path.join(__dirname, '../public', ilan.images[index]);

	fs.unlinkSync(imageToDelete);
	await Ilan.updateOne(
		{ _id: ilanId },
		{ $pull: { images: ilan.images[index] } } // Görseli diziden çıkarın
	);

	res.redirect(`/satisilani/edit/${ilanId}`);

})

router.post('/editpost/:ilanId', allMiddlewares.requireAuth, async (req, res) => {
	const ilanId = req.params.ilanId;
	const ilan = await Ilan.findById(ilanId);


	let images = req.files?.images;

	if (images) {
		if (!Array.isArray(images)) {
			images = [images];
		}

		const maxWidth = 1920;
		const quality = 50;

		for (let element of images) {
			const date = new Date().toISOString().replace(/:/g, '-');
			const imagePath = path.resolve(__dirname, '../public/img/postimages', date + element.name);
			ilan.images.push(`/img/postimages/${date + element.name}`);

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
		description: req.body.description,
		price: req.body.price,
		reachYou: req.body.reachYou,
		images: ilan.images,
	};

	try {
		await Ilan.updateOne(
			{ _id: ilanId },
			{ $set: updatedData }
		);
		res.redirect('/profile');
	} catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})

router.post('/ilan/delete/:ilanId', allMiddlewares.requireAuth, async (req, res) => {
	const ilanId = req.params.ilanId;
	const ilan = await Ilan.findById(ilanId);

	if (!ilan) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (ilan.images.length > 0) {
		for (const address of ilan.images) {
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
		await Ilan.findByIdAndDelete(ilanId);

		await User.updateMany(
			{ favorites: ilanId }, // İlan favorilerde olan kullanıcıları bul
			{ $pull: { favorites: ilanId } } // Favorilerden ilanId'yi sil
		);

		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu.');
	}
})



router.post('/addfavoritesilan/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	const ilanid = req.params.ilanid;
	const userId = req.session.userId;

	try {
		const user = await User.findById(userId);
		if (!user.favorites.includes(ilanid)) {
			user.favorites.push(ilanid);
			await user.save();
		}
		res.json({ success: true, message: 'Favorilere eklendi' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Sunucu hatası');
	}
})

router.post('/deletefavorites/:favoriteid', allMiddlewares.requireAuth, async (req, res) => {
	const favoriteid = req.params.favoriteid;
	const userId = req.session.userId;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).send('Kullanıcı bulunamadı');
		}

		user.favorites = user.favorites.filter(fav => fav.toString() !== favoriteid);
		await user.save();
		res.json({ success: true, message: 'Favorilerden silindi' });
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu');
	}

});

router.get('/ilan/arama', allMiddlewares.requireAuth, async (req, res) => {
    const query = req.query.search || ''; // Arama terimini query'den al
    const page = parseInt(req.query.page) || 1; // Sayfa numarasını al
    const limit = 9; // Sayfa başına gösterilecek öğe sayısı
    const skip = (page - 1) * limit;

    try {
        const results = await Ilan.find({
            $or: [
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ]
        })
        .populate('owner', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalResults = await Ilan.countDocuments({
            $or: [
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ]
        });

        const totalPages = Math.ceil(totalResults / limit);
        const currentUser = await User.findById(req.session.userId);

        res.render('aramasonuc', {
            ilanlar: results,
            searchTerm: query,
            currentUser,
            pagination: {
                totalResults,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (err) {
        res.status(500).send('Bir hata oluştu');
    }
});




module.exports = router;