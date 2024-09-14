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


router.get('/profile', allMiddlewares.requireAuth, async (req, res) => {
	const ilanlar = await Ilan.find({ owner: req.session.userId });
	const user = await User.findById(req.session.userId);
	const jobs = await Job.find({ owner: req.session.userId });
	const kiralar = await Kiraoda.find({ owner: req.session.userId });
	const shortilanlar = await Shortilan.find({ owner: req.session.userId });

	const userFavorites = user.favorites;
	const userFavoritesJob=user.favoritesJob;
	const userFavoritesKira=user.favoritesKira;

	const favorites = await Ilan.find({ _id: { $in: userFavorites } });
	const favoritesJob = await Job.find({ _id: { $in: userFavoritesJob } });
	const favoritesKira = await Kiraoda.find({ _id: { $in: userFavoritesKira } });


	res.render('profile', { ilanlar, user, jobs, kiralar, shortilanlar, favorites,favoritesJob,favoritesKira });
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