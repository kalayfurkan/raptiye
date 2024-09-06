const express = require('express');
const router = express.Router();
const allMiddlewares=require('../middlewares.js');
const Ilan = require('../models/ilanSchema.js');
const User = require('../models/userSchema');


router.get('/profile',allMiddlewares.requireAuth,async (req, res) => {
	const myAllPosts=await Ilan.find({owner:req.session.userId});
	const user=await User.findById(req.session.userId);
	res.render('profile',{ilanlar:myAllPosts,user});
});




module.exports = router;