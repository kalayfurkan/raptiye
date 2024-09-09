const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const Kampusemesaj=require('../models/kampusemesajSchema.js');
const User = require('../models/userSchema');

router.get('/kampusebirmesajbirak',allMiddlewares.requireAuth,(req, res) => {
	res.render('kampusebirmesajver');
})


router.post('/kampusebirmesajbirak',allMiddlewares.requireAuth,async(req, res) => {
	try {
		const message=req.body.mesaj;
	let user;
	const isAnonim=!!req.body.anonim;

	if (isAnonim) {	
        user="Anonim"
    }else{
		const userid=await User.findById(req.session.userId);
		user=userid.username;
	}

	await Kampusemesaj.create({
		mesaj:message,
		owner:user,
	})
	res.redirect('/kampusebirmesajbirak');
	} catch (error) {
		res.status(400).send('bir şeyler yanlış gitti');
	}
	
})

router.get('/kampusemesajlar',allMiddlewares.requireAuth,async(req, res) => {	
	const messages=await Kampusemesaj.find({});
	const userId=req.session.userId;
	res.render('kampusemesajlar',{messages,userId});
})

// Upvote API
router.post('/kampusemesaj/upvote/:id', allMiddlewares.requireAuth, async (req, res) => {
    try {
        await Kampusemesaj.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } });
        res.status(200).send('Upvote başarıyla eklendi.');
    } catch (error) {
        res.status(500).send('Upvote işlemi sırasında bir hata oluştu.');
    }
});

// Downvote API
router.post('/kampusemesaj/downvote/:id', allMiddlewares.requireAuth, async (req, res) => {
    try {
        await Kampusemesaj.findByIdAndUpdate(req.params.id, { $inc: { downvotes: 1 } });
        res.status(200).send('Downvote başarıyla eklendi.');
    } catch (error) {
        res.status(500).send('Downvote işlemi sırasında bir hata oluştu.');
    }
});

router.post('/upvote/:mesajid',allMiddlewares.requireAuth,async (req, res) => {
	try {
		const mesajid=req.params.mesajid;
		const message=await Kampusemesaj.findById(mesajid);

		if (message) {
			if(!message.downVoters.includes(req.session.userId)){
				if (!message.upVoters.includes(req.session.userId)) {
					message.upVoters.push(req.session.userId);
					message.upvotes += 1;
				}
				await message.save();
				res.redirect('/kampusemesajlar'); // Mesajlar sayfasına yönlendir
			}else if(message.downVoters.includes(req.session.userId)){
				message.upVoters.push(req.session.userId);
				message.upvotes += 1;
				message.downVoters.pull(req.session.userId);
				message.downvotes-=1;
				
				await message.save();
				res.redirect('/kampusemesajlar');
			}
            
        } else {
            res.status(404).send('Mesaj bulunamadı.');
        }

	} catch (error) {
		res.status(500).send('something went wrong');
	}
})

router.post('/downvote/:mesajid',allMiddlewares.requireAuth, async (req, res) => {
    try {
        const messageId = req.params.mesajid;
        const message = await Kampusemesaj.findById(messageId);

        if (message) {
            // Downvote işlemi
			if(!message.upVoters.includes(req.session.userId)){
				if (!message.downVoters.includes(req.session.userId)) {
					message.downVoters.push(req.session.userId);
					message.downvotes += 1;
				}
				await message.save();
				res.redirect('/kampusemesajlar'); // Mesajlar sayfasına yönlendir
			}else if(message.upVoters.includes(req.session.userId)){
				message.downVoters.push(req.session.userId);
				message.downvotes += 1;
				message.upVoters.pull(req.session.userId);
				message.upvotes-=1;

				await message.save();
				res.redirect('/kampusemesajlar');
			}
            
        } else {
            res.status(404).send('Mesaj bulunamadı.');
        }
    } catch (error) {
        res.status(500).send('Sunucu hatası.');
    }
})

router.post('/undo-upvote/:id',allMiddlewares.requireAuth, async (req, res) => {
    try {
        const messageId = req.params.id;
        const message = await Kampusemesaj.findById(messageId);

        if (message) {
			if(message.upVoters.includes(req.session.userId)){
				message.upVoters.pull(req.session.userId);
				message.upvotes-=1;
			}
            await message.save();
            res.redirect('/kampusemesajlar'); // Mesajlar sayfasına yönlendir
        } else {
            res.status(404).send('Mesaj bulunamadı.');
        }
    } catch (error) {
        res.status(500).send('Sunucu hatası.');
    }
});


router.post('/undo-downvote/:id',allMiddlewares.requireAuth, async (req, res) => {
    try {
        const messageId = req.params.id;
        const message = await Kampusemesaj.findById(messageId);

        if (message) {
			if(message.downVoters.includes(req.session.userId)){
				message.downVoters.pull(req.session.userId);
				message.downvotes-=1;
			}
            await message.save();
            res.redirect('/kampusemesajlar'); // Mesajlar sayfasına yönlendir
        } else {
            res.status(404).send('Mesaj bulunamadı.');
        }
    } catch (error) {
        res.status(500).send('Sunucu hatası.');
    }
});


module.exports = router;