const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Job = require('../models/jobSchema.js');
const User = require('../models/userSchema');
const path = require('path');
const sharp = require('sharp');
const { uploadToR2, getLoadURL, deleteFromR2 } = require('./s3.js');

router.get('/isilaniekle', allMiddlewares.requireAuth, (req, res) => {
	res.render('addjob');
})


router.post('/addjob', allMiddlewares.requireAuth, async (req, res) => {
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
			const fileName = `${date}-${element.name}`;

			const compressedBuffer = await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toBuffer();

			try {
				await uploadToR2(compressedBuffer, fileName, element.mimetype, "is-ilan");
				imagePaths.push(fileName);
			} catch (uploadError) {
				console.error("Error uploading to R2:", uploadError);
				return res.status(500).send("Dosya yüklenirken bir hata oluştu.");
			}
		}

		await Job.create({
			...req.body,
			images: imagePaths,
			owner: req.session.userId
		})
		req.session.sessionFlash = {
			type: 'alert alert-success',
			message: 'İlanınız başarılı bir şekilde oluşturuldu'
		}

		res.redirect('/isilanlari');

	} catch (error) {
		res.render('errorpage', { message: "Bir hata oluştu" + error });
	}
})


router.get('/isilanlari', allMiddlewares.requireAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Varsayılan sayfa 1
    const limit = 10; // Sayfa başına 10 iş ilanı
    const skip = (page - 1) * limit;

    try {
        // İlanları veritabanından çek
        const jobs = await Job.find({})
            .sort({ createdAt: -1 }) // En son oluşturulan iş ilanlarını önce göster
            .skip(skip) // Atlanacak öğeler
            .limit(limit); // Sayfa başına gösterilecek öğe sayısı

        // Toplam iş ilanı sayısını al
        const totalJobs = await Job.countDocuments();

        // Toplam sayfa sayısını hesapla
        const totalPages = Math.ceil(totalJobs / limit);

        // Mevcut kullanıcıyı al
        const currentUser = await User.findById(req.session.userId);

        // Sayfayı render et
        res.render('isler', {
            jobs: await Promise.all(jobs.map(async job => {
                return {
                    ...job.toObject(),
                    images: await Promise.all(job.images.map(async imageName => await getLoadURL(imageName, "is-ilan")))
                }
            })),
            currentUser,
            pagination: {
                totalJobs,
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


router.get('/isilani/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobid = req.params.jobid;
	const job = await Job.findById(jobid);
	const owner = await User.findById(job.owner);
	const currentUserID = req.session.userId;

    job.images = await Promise.all(job.images.map(async imageName => await getLoadURL(imageName, "is-ilan")));

	res.render('jobDetails', { job, owner, currentUserID });
})

router.get('/isilani/edit/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

    job.images = await Promise.all(job.images.map(async imageName => await getLoadURL(imageName, "is-ilan")));

	res.render('jobEdit', { job, jobid: jobId });
})

router.post('/jobedit/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

	let images = req.files?.images;

	if (images) {
		if (!Array.isArray(images)) {
			images = [images];
		}

		const maxWidth = 1920;
		const quality = 50;
		const bucketName = "is-ilan";
		const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg'];

		for (let element of images) {
			const fileExtension = path.extname(element.name).toLowerCase();
			if (!allowedExtensions.includes(fileExtension)) {
				return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg dosyalarına izin verilmektedir.');
			}

			const date = new Date().toISOString().replace(/:/g, '-');
			const fileName = `${date}-${element.name}`;

			const compressedBuffer = await sharp(element.data)
				.resize(maxWidth)
				.jpeg({ quality: quality })
				.toBuffer();

			try {
				await uploadToR2(compressedBuffer, fileName, element.mimetype, bucketName);
				job.images.push(fileName);
			} catch (error) {
				return res.status(500).send('Resim işlenirken hata oluştu.');
			}
		}
	}

	const updatedData = {
		jobTitle: req.body.jobTitle,
		removalDate: req.body.removalDate,
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

	const index = req.params.index;
	const fileNameToDelete = job.images[index];

	try {
		await deleteFromR2(fileNameToDelete, "is-ilan");
		await Job.updateOne(
			{ _id: jobId },
			{ $pull: { images: fileNameToDelete } } // Remove the filename from the array
		);
		res.redirect(`/isilani/edit/${jobId}`);
	} catch (deleteError) {
		console.error("Error deleting from R2:", deleteError);
		return res.status(500).send("Dosya silinirken bir hata oluştu.");
	}

})

router.post('/job/delete/:jobid', allMiddlewares.requireAuth, async (req, res) => {
	const jobId = req.params.jobid;
	const job = await Job.findById(jobId);

	if (!job) {
		return res.status(404).send('İlan bulunamadı.');
	}

	if (job.images.length > 0) {
		for (const fileName of job.images) {
			try {
				await deleteFromR2(fileName, "is-ilan");
				console.log(`Image deleted from R2: ${fileName}`);
			} catch (error) {
				console.error(`Failed to delete image from R2: ${fileName}`, error);
			}
		}
	}

	try {
		await Job.deleteOne({ _id: jobId });

		await User.updateMany(
			{ favoritesJob: jobId },
			{ $pull: { favoritesJob: jobId } }
		);

		res.redirect('/profile');
	} catch (error) {
		console.error(error);
		res.status(500).send('Bir hata oluştu.');
	}
})



router.post('/jobaddfavorites/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	const favoriteid = req.params.ilanid;
	const userId = req.session.userId;

	try {
		const user = await User.findById(userId);
		if (!user.favoritesJob.includes(favoriteid)) {
			user.favoritesJob.push(favoriteid);
			await user.save();
		}
		res.json({ success: true, message: 'Favorilere eklendi' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Sunucu hatası');
	}
})

router.post('/jobdeletefavorites/:ilanid', allMiddlewares.requireAuth, async (req, res) => {
	const favoriteid = req.params.ilanid;
	const userId = req.session.userId;


	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
		}

		user.favoritesJob = user.favoritesJob.filter(fav => fav.toString() !== favoriteid);
		await user.save();
		res.json({ success: true, message: 'Favorilerden silindi' });
	} catch (err) {
		console.error(err);
		res.status(500).send('Sunucu hatası');
	}
})

module.exports = router;