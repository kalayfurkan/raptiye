const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Ilan = require('../models/ilanSchema.js');
const User = require('../models/userSchema');
const Job = require('../models/jobSchema');
const Kiraoda = require('../models/kiraodaSchema.js');
const Shortilan = require('../models/shortTermilanSchema.js');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const bcrypt = require('bcrypt');

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


router.get('/profile', allMiddlewares.requireAuth, async (req, res) => {
	const myAllPosts = await Ilan.find({ owner: req.session.userId });
	const user = await User.findById(req.session.userId);
	const jobs = await Job.find({ owner: req.session.userId });
	const kiralar = await Kiraoda.find({ owner: req.session.userId });
	const shortilanlar = await Shortilan.find({ owner: req.session.userId });

	const userFavorites = user.favorites;
	const favorites = await Ilan.find({ _id: { $in: userFavorites } })
	res.render('profile', { ilanlar: myAllPosts, user, jobs, kiralar, shortilanlar, favorites });
});

router.get('/profile/:userid', allMiddlewares.requireAuth, async (req, res) => {
	const userid = req.params.userid;
	const user = await User.findById(userid);

	const posts = await Ilan.find({ owner: userid });
	const jobs = await Job.find({ owner: userid });
	const kiralar = await Kiraoda.find({ owner: userid });
	const shortilanlar = await Shortilan.find({ owner: userid });

	res.render('anyprofile', { user, posts, jobs, kiralar, shortilanlar });
})

router.get('/editprofile/:userid', allMiddlewares.requireAuth, async (req, res) => {
	const userid = req.params.userid;
	const user = await User.findById(userid);
	res.render('editprofile', { user });
});

router.post('/editprofile/:userid', allMiddlewares.requireAuth, async (req, res) => {
	const userid = req.params.userid;
	const user = await User.findById(userid);

	if (!user) {
		return res.status(404).send('User not found.');
	}

	try {
		if (req.files && req.files.profilePic) {
			try {
				if (user.profilePic) {
					const oldPicPath = path.join(__dirname, '../public/', user.profilePic);
					if (fs.existsSync(oldPicPath)) {
						fs.unlinkSync(oldPicPath);
					}
				}

				const date = new Date().toISOString().replace(/:/g, '-');
				const imagePath = path.resolve(__dirname, '../public/img/profilepictures', date + req.files.profilePic.name);

				const maxWidth = 1000;
				const quality = 100;

				await sharp(req.files.profilePic.data)
					.resize(maxWidth)
					.jpeg({ quality: quality })
					.toFile(imagePath);

				await User.updateOne({ _id: userid }, { $set: { profilePic: `/img/profilepictures/${date + req.files.profilePic.name}` } });
			} catch (error) {
				res.status(400).send('Bir hata oluştu');
			}
		}
		if(req.body.username!=user.username || req.body.info!=user.info){
			await User.updateOne({ _id: userid }, { $set: { info: req.body.info, username: req.body.username } });
		}
		res.redirect('/profile');
	} catch (error) {
		res.status(400).send('Bir hata oluştu');
	}
})

router.post('/profile/:userid/change-password',allMiddlewares.requireAuth,async (req,res) => {
	const userid=req.params.userid;
	const user=await User.findById(userid);

	const { currentPassword, newPassword, confirmPassword } = req.body;

	if (!user) {
        return res.status(404).send('User not found.');
    }

	try {
        // 1. Kullanıcının mevcut şifresini doğrula
        const isMatch = await bcrypt.compare(currentPassword, user.password); // Kullanıcının mevcut şifresi
        if (!isMatch) {
            return res.status(400).render('errorpage',{message:"Mevcut Şifrenizle girdiğiniz mevcut şifre uyuşmuyor."});
        }

        // 2. Yeni şifreyi kontrol et
        if (newPassword !== confirmPassword) {
            return res.status(400).render('errorpage',{message:"Yeni Şifreyi ikinci seferinde yanlış girdiniz"});
        }

        // 3. Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Veritabanında şifreyi güncelle
        user.password = hashedPassword;
        await user.save();

        res.redirect('/profile')
    } catch (error) {
        res.status(500).send('Bir hata oluştu: ' + error.message);
    }

})


module.exports = router;