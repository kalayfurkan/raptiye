const { CronJob } = require('cron');
const Job = require('./models/jobSchema.js'); // Job modelini içe aktar
const Shortilan = require('./models/shortTermilanSchema.js');
const { deleteFromR2 } = require('./routing/s3.js');
const User = require('./models/userSchema.js');

const deleteJob=new CronJob('0 0 * * *',async () => {
  try {
	const today = new Date();
    const jobsToDelete = await Job.find({ removalDate: { $lte: today } });

	for (const job of jobsToDelete) {
		if (job.images && job.images.length > 0) {
		  for (const fileName of job.images) {
			if (fileName == "" || !fileName) continue;
			try {
				await deleteFromR2(fileName, "is-ilan");
			} catch (err) {
				console.error(`Failed to delete image from R2: ${fileName}`, err);
			}
		  }
		}
  
		await Job.findByIdAndDelete(job._id);
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
				if (fileName == "" || !fileName) continue;
				try {
					await deleteFromR2(fileName, "kisa-ilan");
				} catch (err) {
					console.error(`Failed to delete image from R2: ${fileName}`, err);
				}
			}
		}
  
		await Shortilan.findByIdAndDelete(ilan._id);
	}
    
  } catch (error) {
	console.error('İlanları silerken hata oluştu:', error);
  }
})

const deleteUnverifiedUsers = new CronJob('0 0 * * 0', async () => {
	try {
	  const result = await User.deleteMany({ isVerified: false });
  
	  if (result.deletedCount > 0) {
		console.log(`${result.deletedCount} adet doğrulanmamış kullanıcı silindi.`);
	  } else {
		console.log("Silinecek doğrulanmamış kullanıcı bulunamadı.");
	  }
	  
	} catch (error) {
	  console.error('Doğrulanmamış kullanıcıları silerken hata oluştu:', error);
	}
});
  
deleteUnverifiedUsers.start();
deleteJob.start();
deleteIlan.start();