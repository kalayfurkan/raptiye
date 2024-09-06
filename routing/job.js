const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Job = require('../models/jobSchema.js');
const User = require('../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

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


router.get('/isler', allMiddlewares.requireAuth, async (req, res) => {
	const jobs = await Job.find({});
	res.render('isler', { jobs });
})

router.get('/isler/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobid = req.params.jobid;
	const job = await Job.findById(jobid);
	const owner = await User.findById(job.owner);
	res.render('jobDetails', { job, owner });
})

router.get('/job/edit/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

	res.render('jobEdit',{job,jobid:jobId});
})

router.post('/jobedit/:jobid',allMiddlewares.requireAuth,async(req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

	let images = req.files?.images;

	if(images){
		if (!Array.isArray(images)) {
			images = [images];
		}
	
		const maxWidth = 600;
		const quality = 50;
	
		for (let element of images) {
			const date = new Date().toISOString().replace(/:/g, '-');
			const imagePath = path.resolve(__dirname, '../public/img/jobimages', date + element.name);
			job.images.push(`/img/jobimages/${date + element.name}`);
	
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
		jobTitle: req.body.jobTitle,
		removalDate:req.body.removalDate,
		description: req.body.description,
		images: job.images,
	};

	try {
		await Job.updateOne(
			{ _id: jobId },
			{ $set: updatedData }
		);
		res.redirect('/profile');
	} catch (error) {
		res.status(500).send('Bir hata oluştu.');
	}
})

router.post('/delete-jobimage/:jobid/:index', allMiddlewares.requireAuth, async (req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);
	console.log(job);
	
	const index = req.params.index;
	const imageToDelete = path.join(__dirname, '../public', job.images[index]);

	fs.unlinkSync(imageToDelete);
	await Job.updateOne(
		{ _id: jobId },
		{ $pull: { images: job.images[index] } } // Görseli diziden çıkarın
	);

	res.redirect(`/job/edit/${jobId}`);

})

router.post('/job/delete/:jobid',allMiddlewares.requireAuth,async(req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

	if (!job) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (job.images.length > 0) {
		for (const address of job.images) {
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
		await Job.deleteOne({ _id: jobId });
		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu.');
	}
})

module.exports = router;