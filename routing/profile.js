const express = require('express');
const router = express.Router();
const allMiddlewares=require('../middlewares.js');
const Ilan = require('../models/ilanSchema.js');
const User = require('../models/userSchema');
const Job = require('../models/jobSchema');
const Kiraoda = require('../models/kiraodaSchema.js');
const Shortilan = require('../models/shortTermilanSchema.js');

router.post('/addfavoritesilan/:ilanid',allMiddlewares.requireAuth,async (req, res) => {
	const ilanid=req.params.ilanid;
	const userId = req.session.userId; 

	try {
        const user = await User.findById(userId);
        if (!user.favorites.includes(ilanid)) {
            user.favorites.push(ilanid);
            await user.save();
        }
         res.redirect('/profile')
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
})

router.post('/deletefavorites/:favoriteid',allMiddlewares.requireAuth,async (req, res) => {
	const favoriteid=req.params.favoriteid;
	const userId=req.session.userId;

	try {
		const user = await User.findById(userId);

		if (!user) {
            return res.status(404).send('Kullanıcı bulunamadı');
        }

		user.favorites = user.favorites.filter(fav => fav.toString() !== favoriteid);
        await user.save();
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
        res.status(500).send('Bir hata oluştu');
	}

});


router.get('/profile',allMiddlewares.requireAuth,async (req, res) => {
	const myAllPosts=await Ilan.find({owner:req.session.userId});
	const user=await User.findById(req.session.userId);
	const jobs=await Job.find({owner:req.session.userId});
	const kiralar=await Kiraoda.find({owner:req.session.userId});
	const shortilanlar=await Shortilan.find({owner:req.session.userId});

	const userFavorites = user.favorites;
	const favorites=await Ilan.find({_id: { $in: userFavorites }})
	res.render('profile',{ilanlar:myAllPosts,user,jobs,kiralar,shortilanlar,favorites});
});




module.exports = router;