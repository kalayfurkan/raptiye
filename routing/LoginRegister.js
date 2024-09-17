const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/register', async (req, res) => {
	try {
		const { password, username, email } = req.body;
		const verificationToken = crypto.randomBytes(32).toString('hex');

		const allowedMail = "@itu.edu.tr";
		if (!email.endsWith(allowedMail)) {
			return res.status(400).render('errorpage', { message: `You must use ${allowedMail} mail type` });
		}

		// Şifreyi hashleyin
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		console.log("anan");
		console.log(hashedPassword);

		await User.create({ username, password: hashedPassword, email, verificationToken });

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASSWORD
			}
		});

		const mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: 'İTÜ Raptiye mail doğrulama',
			html: `<a href="http://localhost:3000/verify-email?token=${verificationToken}">Linke tıklayarak mailinizi doğrulayın.</a>`
		};

		const info = await transporter.sendMail(mailOptions);

		console.log('Email sent: ' + info.response);



		res.send('Başarıyla kayıt oldunuz <a href="https://webmail.itu.edu.tr/login.php">linke</a> tıklayarak mailinize gidip hesabınızı doğrulayın.');

	} catch (error) {
		res.status(400).render('errorpage', { message: "@itu.edu.tr uzantılı bir mail ile kaydolmadınız ya da kullanıcı adınız başka bir kullanıcı tarafından alınmış." });
	}
})

router.get('/verify-email', async (req, res) => {
	const { token } = req.query;

	const user = await User.findOne({ verificationToken: token });

	if (!user) {
		return res.status(400).send('Invalid token');
	}

	user.isVerified = true;
	user.verificationToken = null;
	await user.save();

	res.send('Mailiniz doğrulandı. <a href="localhost:3000/">Buradan</a> ana sayfaya dönüp giriş yapabilirsiniz.');
});

router.post('/login', async (req, res) => {
	try {
		const { email, password, rememberMe } = req.body;

		const user = await User.findOne({ email });

		if (user) {
			if (!user.isVerified) {
				return res.status(400).render('errorpage', { message: "Lütfen mailinizi doğrulayın." });
			}

			const same = await bcrypt.compare(password, user.password);
			if (same) {
				// Regenerating the session to prevent session fixation attacks
				req.session.regenerate((err) => {
					if (err) {
						console.error('Session regeneration error:', err);
						return res.status(500).render('errorpage', { message: "Oturum işlemi sırasında bir hata oluştu." });
					}

					// After regenerating, storing user info in the session
					req.session.userId = user._id;
					req.session.cookie.maxAge = rememberMe ? 14 * 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;  // 14 days or 6 hours

					res.redirect('/');
				});
			} else {
				res.status(401).render('errorpage', { message: "Şifrenizi yanlış girdiniz." });
			}
		} else {
			return res.status(401).render('errorpage', { message: "E-posta adresi veya şifre hatalı." });
		}
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/logout', (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			return res.status(500).render('errorpage', { message: "Oturum kapatılamadı, lütfen tekrar deneyin." });
		}
		res.redirect('/');
	})
})




module.exports = router;