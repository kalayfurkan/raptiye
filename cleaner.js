const { CronJob } = require('cron');
const fs = require('fs');
const path = require('path');
const Job = require('./models/jobSchema'); // Job modelini içe aktar

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

deleteJob.start();