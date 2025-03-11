const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');
const nodemailer = require('nodemailer');

router.get('/', (req, res) => {
	res.render('home');
})
router.get('/login', (req, res) => {
    if(req.session.userId){
        res.redirect('/');
    }
	res.render('login',{message:""});
});
router.get('/errorpage', (req, res) => {
	res.render('errorpage');
});
router.get('/register', (req, res) => {
    if(req.session.userId){
        res.redirect('/');
    }
	res.render('register',{message:""});
});

//Ömer done that
router.get('/harfnotuhesapla', (req, res) => {
	res.render('lettergrade');
});

//Ömer on it again
router.get('/hakkimizda', (req, res) => {
	res.render('hakkimizda');
});

router.get('/forgotpassword',async(req, res)=>{
    if(req.session.userId){
        res.redirect('/');
    }
    res.render('forgotpassword');
})
router.post('/contact-us',(req,res) => {
	const { email, message } = req.body;

	// Nodemailer transporter'ı yapılandır
    const transporter = nodemailer.createTransport({
        // service: 'gmail', // Gmail kullanıyorsanız 'gmail' kullanabilirsiniz.
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for port 465, false for others
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
            //console.log(error);
            res.send('E-posta gönderme başarısız oldu.');
        } else {
            //console.log('E-posta başarıyla gönderildi: ' + info.response);
            res.redirect('/');
        }
    });
});


module.exports = router;