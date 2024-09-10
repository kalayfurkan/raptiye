const { CronJob } = require('cron');
const fs = require('fs');
const path = require('path');
const Job = require('./models/jobSchema'); // Job modelini içe aktar
const Shortilan = require('./models/shortTermilanSchema.js');

const deleteJob=new CronJob('0 0 * * *',async () => {
  try {
	const today = new Date();
    const jobsToDelete = await Job.find({ removalDate: { $lte: today } });

	for (const job of jobsToDelete) {
		if (job.images && job.images.length > 0) {
		  job.images.forEach((image) => {
			const imagePath = path.join(__dirname, 'public', image);
			try {
				fs.unlinkSync(imagePath);
				console.log(`Görsel başarıyla silindi: ${imagePath}`);
			  } catch (err) {
				console.error(`Görsel silinemedi: ${imagePath}`, err);
			  }
		  });
		}
  
		await Job.findByIdAndDelete(job._id);
		console.log(`İlan silindi: ${job.jobTitle}`);
	}
	
  } catch (error) {
	console.error('İlanlar silinirken hata oluştu:', error);
  }
})


const deleteIlan=new CronJob('*/30 * * * *',async () => {
  try {
	const now = new Date();
	const result = await Shortilan.find({ removalDate: { $lt: now } });
	for (const ilan of result) {
		if (ilan.images && ilan.images.length > 0) {
			ilan.images.forEach((image) => {
			const imagePath = path.join(__dirname, 'public', image);
			try {
				fs.unlinkSync(imagePath);
				console.log(`Görsel başarıyla silindi: ${imagePath}`);
			  } catch (err) {
				console.error(`Görsel silinemedi: ${imagePath}`, err);
			  }
		  });
		}
  
		await Shortilan.findByIdAndDelete(ilan._id);
		console.log(`İlan silindi: ${ilan.title}`);
	}
    
  } catch (error) {
	console.error('İlanları silerken hata oluştu:', error);
  }
})

deleteJob.start();
deleteIlan.start();