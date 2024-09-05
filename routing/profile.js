const express = require('express');
const router = express.Router();
const allMiddlewares=require('../middlewares.js');
const Ilan = require('../models/ilanSchema.js');



router.get('/profile',allMiddlewares.requireAuth,async (req, res) => {
	const myAllPosts=await Ilan.find({owner:req.session.UserId});
	res.render('profile');
});



module.exports = router;