const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Job = require('../models/jobSchema.js');
const User = require('../models/userSchema');
const path = require('path');
const sharp = require('sharp');

router.get('/addjob', allMiddlewares.requireAuth, (req, res) => {
	res.render('addjob');
})


router.post('/addjob', allMiddlewares.requireAuth, async (req, res) => {
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
			const imagePath = path.resolve(__dirname, '../public/img/jobimages', date + element.name);
			imagePaths.push(`/img/jobimages/${date + element.name}`);

			await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toFile(imagePath);
		}

		await Job.create({
			...req.body,
			images: imagePaths,
			owner: req.session.userId
		})

		res.redirect('/');
	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}
})


router.get('/isler', allMiddlewares.requireAuth, async(req, res) => {
	const jobs=await Job.find({});
	res.render('isler',{jobs});
})
router.get('/isler/:jobid', allMiddlewares.requireAuth, async(req, res) => {
	const jobid = req.params.jobid;
    const job = await Job.findById(jobid);
	const owner= await User.findById(job.owner);
	res.render('jobDetails',{job,owner});
})




module.exports = router;