const { CronJob } = require('cron');
const Job = require('./models/jobSchema'); // Job modelini içe aktar
const Shortilan = require('./models/shortTermilanSchema.js');
const { deleteFromR2 } = require('./routing/s3.js');

const deleteJob=new CronJob('0 0 * * *',async () => {
  try {
	const today = new Date();
    const jobsToDelete = await Job.find({ removalDate: { $lte: today } });

	for (const job of jobsToDelete) {
		if (job.images && job.images.length > 0) {
		  for (const fileName of job.images) {
			try {
				await deleteFromR2(fileName, "is-ilan");
				console.log(`Image deleted from R2: ${fileName}`);
			} catch (err) {
				console.error(`Failed to delete image from R2: ${fileName}`, err);
			}
		  }
		}
  
		await Job.findByIdAndDelete(job._id);
		console.log(`İlan silindi: ${job.jobTitle}`);
	}
	
  } catch (error) {
	console.error('İlanlar silinirken hata oluştu:', error);
  }
})


const deleteIlan=new CronJob('*/15 * * * *',async () => {
  try {
	const now = new Date();
	const result = await Shortilan.find({ removalDate: { $lt: now } });

	if (result.length === 0) {
		return; // Eğer silinecek ilan yoksa fonksiyonu sonlandırıyoruz
	}

	for (const ilan of result) {
		if (ilan.images && ilan.images.length > 0) {
			for (const fileName of ilan.images) {
				try {
					await deleteFromR2(fileName, "kisa-ilan");
					console.log(`Image deleted from R2: ${fileName}`);
				} catch (err) {
					console.error(`Failed to delete image from R2: ${fileName}`, err);
				}
			}
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