const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Kampusemesaj = require('../models/kampusemesajSchema.js');
const User = require('../models/userSchema');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { uploadToR2, getLoadURL, deleteFromR2 } = require('./s3.js');

router.get('/kampusebirmesajbirak', allMiddlewares.requireAuth, (req, res) => {
	res.render('kampusebirmesajver');
})


router.post('/kampusebirmesajbirak', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const message = req.body.mesaj;
		let user;
		const isAnonim = !!req.body.anonim;

		const maxWidth = 1920;
		const quality = 50;

		if (isAnonim) {
			user = null;
		} else {
			const userid = await User.findById(req.session.userId);
			user = userid._id;
		}

		let fileName = null;
		// Dosya var mı kontrolü
		if (req.files && req.files.images) {
			try {
				const image = req.files.images;
				const allowedExtensions = ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif'];
				const fileExtension = path.extname(image.name).toLowerCase();

				if (!allowedExtensions.includes(fileExtension)) {
					return res.status(400).send('Geçersiz dosya formatı. Sadece .avif, .webp, .png, .jpg, .jpeg, .gif dosyalarına izin verilmektedir.');
				}

				const date = new Date().toISOString().replace(/:/g, '-');
				fileName = `${date}-${image.name}`;

				const compressedBuffer = await sharp(image.data)
					.resize(maxWidth)
					.jpeg({ quality: quality })
					.toBuffer();

				await uploadToR2(compressedBuffer, fileName, image.mimetype, "kampus-mesaj");
				
			} catch (error) {
				console.error("Error uploading to R2:", error);
				return res.render('errorpage', { message: "Bir hata oluştu: " + error.message });
			}
		}

		await Kampusemesaj.create({
			mesaj: message,
			owner: user,
			 images: fileName
		})
		res.redirect('/kampusemesajlar');
	} catch (error) {
		res.status(400).send('bir şeyler yanlış gitti');
	}

})

router.get('/kampusemesajlar', allMiddlewares.requireAuth, async (req, res) => {
    const sortOption = req.query.sort || 'newest'; // Varsayılan sıralama: newest
    const userId = req.session.userId;
    const page = parseInt(req.query.page) || 1; // Varsayılan sayfa: 1
    const limit = 20; // Sayfa başına 10 mesaj
    const skip = (page - 1) * limit;

    let query = {};
    let sort = {};

    // Sıralama seçeneğine göre sorguyu değiştiriyoruz
    if (sortOption === 'topVotes') {
        sort = { upvotes: -1 };
    } else if (sortOption === 'worstVotes') {
        sort = { downvotes: -1 };
    } else if (sortOption === 'myMessages') {
        query = { owner: userId };
    } else {
        sort = { createdAt: -1 }; // Default sıralama: yeniden eskiye
    }

    try {
        // Mesajları getir
        const messages = await Kampusemesaj.find(query)
            .sort(sort)
            .populate('owner')
            .populate('yorumlar.owner')
            .skip(skip)
            .limit(limit)
            .exec();

        // Toplam mesaj sayısını hesapla
        const totalMessages = await Kampusemesaj.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limit);

        res.render('kampusemesajlar', {
            messages: await Promise.all(messages.map(async message => {
                let imageUrl = null;
                if (message.images) {
                    try {
                        imageUrl = await getLoadURL(message.images, "kampus-mesaj");
                    } catch (error) {
                        console.error("Error fetching image URL:", error);
                    }
                }
                return {
                    ...message.toObject(),
                    images: imageUrl
                }
            })),
            userId,
            sortOption,
            pagination: {
                currentPage: page,
                totalPages,
                perPage: limit,
                totalMessages,
            },
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


router.post('/deletekampusmesaj/:kampusemesajid', allMiddlewares.requireAuth, async (req, res) => {
	const kampusemesajid = req.params.kampusemesajid;
	try {
		const currentUser=await User.findById(req.session.userId);
		const currentMessage=await Kampusemesaj.findById(kampusemesajid);

		
		if(currentUser && currentMessage && currentUser._id.equals(currentMessage.owner)){
			if (currentMessage.images) {
				try {
					await deleteFromR2(currentMessage.images, "kampus-mesaj");
					console.log(`Image deleted from R2: ${currentMessage.images}`);
				} catch (error) {
					console.error(`Failed to delete image from R2: ${currentMessage.images}`, error);
				}
			}
			await Kampusemesaj.findByIdAndDelete(kampusemesajid);
			res.redirect('/kampusemesajlar');
		}else{
			res.status(403).send('Bu mesajı silme izniniz yok.');
		}
	} catch (error) {
		console.error('Mesaj silinirken bir hata oluştu:', error);
		res.status(500).send('Bir hata oluştu. Lütfen tekrar deneyin.');
	}
})

router.post('/upvote/:mesajid', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const mesajid = req.params.mesajid;
		const message = await Kampusemesaj.findById(mesajid);

		if (message) {
			if (!message.downVoters.includes(req.session.userId)) {
				if (!message.upVoters.includes(req.session.userId)) {
					message.upVoters.push(req.session.userId);
					message.upvotes += 1;
				}
				await message.save();
				res.json({ success: true, type: 'upvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
			}
			else if (message.downVoters.includes(req.session.userId)) {
				message.upVoters.push(req.session.userId);
				message.upvotes += 1;
				message.downVoters.pull(req.session.userId);
				message.downvotes -= 1;

				await message.save();
				res.json({ success: true, type: 'upvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
			}

		} else {
			res.status(404).send('Mesaj bulunamadı.');
		}

	} catch (error) {
		res.status(500).send('something went wrong');
	}
})

router.post('/downvote/:mesajid', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const messageId = req.params.mesajid;
		const message = await Kampusemesaj.findById(messageId);

		if (message) {
			// Downvote işlemi
			if (!message.upVoters.includes(req.session.userId)) {
				if (!message.downVoters.includes(req.session.userId)) {
					message.downVoters.push(req.session.userId);
					message.downvotes += 1;
				}
				await message.save();
				res.json({ success: true, type: 'downvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
			} else if (message.upVoters.includes(req.session.userId)) {
				message.downVoters.push(req.session.userId);
				message.downvotes += 1;
				message.upVoters.pull(req.session.userId);
				message.upvotes -= 1;

				await message.save();
				res.json({ success: true, type: 'downvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
			}

		} else {
			res.status(404).send('Mesaj bulunamadı.');
		}
	} catch (error) {
		res.status(500).send('Sunucu hatası.');
	}
})

router.post('/undo-upvote/:id', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const messageId = req.params.id;
		const message = await Kampusemesaj.findById(messageId);

		if (message) {
			if (message.upVoters.includes(req.session.userId)) {
				message.upVoters.pull(req.session.userId);
				message.upvotes -= 1;
			}
			await message.save();
			res.json({ success: true, type: 'undo-upvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
		} else {
			res.status(404).send('Mesaj bulunamadı.');
		}
	} catch (error) {
		res.status(500).send('Sunucu hatası.');
	}
});


router.post('/undo-downvote/:id', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const messageId = req.params.id;
		const message = await Kampusemesaj.findById(messageId);

		if (message) {
			if (message.downVoters.includes(req.session.userId)) {
				message.downVoters.pull(req.session.userId);
				message.downvotes -= 1;
			}
			await message.save();
			res.json({ success: true, type: 'undo-downvote', newUpvoteCount: message.upvotes, newDownvoteCount: message.downvotes });
		} else {
			res.status(404).send('Mesaj bulunamadı.');
		}
	} catch (error) {
		res.status(500).send('Sunucu hatası.');
	}
});

router.post('/add-comment', allMiddlewares.requireAuth, async (req, res) => {
	try {
		const { messageId, yorum } = req.body;
		const userId = req.session.userId;

		await Kampusemesaj.findByIdAndUpdate(
			messageId,  // Formdan gelen messageId'yi kullanarak ilgili mesajı buluruz
			{
				$push: {
					yorumlar: {
						yorum: yorum,
						owner: userId,  // Yorum sahibi olarak kullanıcı ID'si eklenir
						createdAt: new Date()  // Yorumun oluşturulma zamanı
					}
				}
			},
			{ new: true }  // Güncellenmiş belgeyi döndür
		);
		res.redirect('/kampusemesajlar');
	} catch (error) {
		console.error('Yorum eklenirken hata oluştu:', error);
		res.status(500).send('Yorum eklenirken bir hata oluştu.');

	}
})

module.exports = router;