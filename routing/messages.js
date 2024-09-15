const Message = require('../models/messageSchema');
const User = require('../models/userSchema');
const allMiddlewares = require('../middlewares.js');
const express = require('express');
const router = express.Router();


router.get('/messages/:user1id/:user2id', allMiddlewares.requireAuth, async (req, res) => {
	const user1 = req.params.user1id;
	const user2 = req.params.user2id;
	const infoUser1 = await User.findById(user1);
	const infoUser2 = await User.findById(user2);

	const currentUser = await User.findById(req.session.userId);
	try {
		let conversation = await Message.findOne({
			communicators: { $all: [user1, user2] } // İki kullanıcıyı array içinde sırasız olarak bulur
		});

		if (!conversation) {
			conversation = new Message({
				communicators: [user1, user2],
				texts: [] // Henüz mesaj yok, boş başlatıyoruz
			});

			// Yeni konuşmayı veritabanına kaydet
			await conversation.save();
		};

		res.render('messages', { messages: conversation.texts, communicators: conversation.communicators, infoUser1, infoUser2, currentUser });
	} catch (error) {
		console.error(error);
		res.status(500).send('Server Error');
	}
});

router.post('/messages/:user1id/:user2id', allMiddlewares.requireAuth, async (req, res) => {
	const user1 = req.params.user1id;
	const user2 = req.params.user2id;

	try {
		const conversation = await Message.findOne({
			communicators: { $all: [user1, user2] } // İki kullanıcıyı array içinde sırasız olarak bulur
		});

		conversation.texts.push({ sender: req.session.userId, content: req.body.message, timestamp: new Date() })
		await conversation.save();

		res.redirect(`/messages/${user1}/${user2}`);
	} catch (error) {
		console.error(error);
		res.status(500).send('Server Error');
	}
})


router.get('/gelenkutusu',allMiddlewares.requireAuth,async (req,res) => {
	const currentUserId=req.session.userId;

	try {
		const messages = await Message.find({
		  communicators: currentUserId
		}).populate('communicators', 'username') // İsteğe bağlı: Kullanıcı adlarını da ekleyebiliriz
		  .sort({ 'texts.timestamp': -1 }); // İsteğe bağlı: Mesajları zaman sırasına göre sıralayabiliriz
	
		res.render('gelenkutusu', { messages, currentUserId });
	  } catch (error) {
		console.error(error);
		res.status(500).send('Server Error');
	  }
});

module.exports = router;