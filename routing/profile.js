const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Ilan = require('../models/ilanSchema.js');
const User = require('../models/userSchema');
const Job = require('../models/jobSchema');
const Kiraoda = require('../models/kiraodaSchema.js');
const Shortilan = require('../models/shortTermilanSchema.js');
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const { uploadToR2, deleteFromR2 }= require('./s3.js');


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

router.get('/profile/:username', allMiddlewares.requireAuth, async (req, res) => {
	const username = req.params.username;
    console.log("username:", username);
	const user = await User.findOne({username:username});
    console.log("user:", user);
	const currentUser= await User.findById(req.session.userId);
    console.log("currentUser&user:", currentUser, user);
	if(currentUser._id.equals(user?._id)){
		return res.redirect('/profile');
	}

	const posts = await Ilan.find({ owner: user._id });
	const jobs = await Job.find({ owner: user._id });
	const kiralar = await Kiraoda.find({ owner: user._id });
	const shortilanlar = await Shortilan.find({ owner: user._id });

	res.render('anyprofile', { user, posts, jobs, kiralar, shortilanlar,currentUser });
})

router.get('/editprofile/:username', allMiddlewares.requireAuth, async (req, res) => {
	const username = req.params.username;
	const user = await User.findOne({username:username});
	res.render('editprofile', { user });
});

router.post('/editprofile/:username', allMiddlewares.requireAuth, async (req, res) => {
	const username = req.params.username;
	const user = await User.findOne({username:username});

	if (!user) {
		return res.status(404).send('User not found.');
	}

	try {
		if (req.files && req.files.profilePic) {
            
            const oldProfilePic = user.profilePic; 

            // Prepare the new image
            const date = new Date().toISOString().replace(/:/g, '-');
            const fileName = `${date}-${req.files.profilePic.name.replace('/', '_')}`;

            const maxWidth = 1000;
            const quality = 50;

            // Check the file extension
            const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];
            const fileExtension = path.extname(req.files.profilePic.name).toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg dosyalarına izin verilmektedir.');
            }

                
            try {
                const compressedBuffer = await sharp(req.files.profilePic.data)
                    .resize(maxWidth)
                    .jpeg({ quality: quality })
                    .toBuffer();
                // Upload to Cloudflare R2 and update user profile in parallel
                await Promise.all([
                    uploadToR2(compressedBuffer, fileName, req.files.profilePic.mimetype, "profile-images"),
                    User.updateOne({ username: username }, { $set: { profilePic: `/images/profile-images/${fileName}` } })
                ]);

                // Delete old profile picture if it's not the default one
                if (oldProfilePic && oldProfilePic !== "/img/Default_pfp.svg.png") {
                    await deleteFromR2(oldProfilePic, "profile-images");
                }
            } catch (error) {
                console.error("Error while processing profile picture:", error);
                return res.status(400).send('Bir hata oluştu');
            }
        }
		if(req.body.username!=user.username || req.body.info!=user.info){
			await User.updateOne({ username: username }, { $set: { info: req.body.info, username: req.body.username } });
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
            return res.status(400).render('loggenerrorpage',{message:"Mevcut Şifrenizle girdiğiniz mevcut şifre uyuşmuyor."});
        }

        // 2. Yeni şifreyi kontrol et
        if (newPassword !== confirmPassword) {
            return res.status(400).render('loggenerrorpage',{message:"Yeni Şifreyi ikinci seferinde yanlış girdiniz"});
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