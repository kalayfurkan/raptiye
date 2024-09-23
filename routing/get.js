const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const nodemailer = require('nodemailer');

router.get('/', (req, res) => {
	console.log(req.session);
	res.render('home');
})
router.get('/login', (req, res) => {
	res.render('login');
});
router.get('/ilandetay', (req, res) => {
	res.render('ilandetay');
});
router.get('/addpost', allMiddlewares.requireAuth, (req, res) => {
	res.render('addpost');
});
router.get('/errorpage', (req, res) => {
	res.render('errorpage');
});
router.get('/register', (req, res) => {
	res.render('register');
});

//Ömer done that
router.get('/lettergrade', (req, res) => {
	res.render('lettergrade');
});

//Ömer on it again
router.get('/hakkimizda', (req, res) => {
	res.render('hakkimizda');
});

router.post('/contact-us',(req,res) => {
	const { email, message } = req.body;

	// Nodemailer transporter'ı yapılandır
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail kullanıyorsanız 'gmail' kullanabilirsiniz.
        auth: {
            user: process.env.EMAIL, // Kendi mail adresiniz
            pass: process.env.EMAIL_PASSWORD // Kendi şifreniz
        }
    });

	const mailOptions = {
        from: process.env.EMAIL, // Kullanıcının e-posta adresi
        to: process.env.EMAIL, // Gönderilecek hedef e-posta adresi
        subject: "İTÜ Raptiye İstek,Şikayet veya Öneriler", // Konu başlığı
        text: message, // Mesaj içeriği
		replyTo:email
    };

	transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('E-posta gönderme başarısız oldu.');
        } else {
            console.log('E-posta başarıyla gönderildi: ' + info.response);
            res.redirect('/');
        }
    });
});


module.exports = router;