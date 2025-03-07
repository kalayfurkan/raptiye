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
			return res.status(400).render('register', { message: "İTÜ mailiniz ile kaydolmalısınız." });
		}
		const isThereBefore=await User.findOne({ email: email });
		if(isThereBefore && isThereBefore.isVerified==false){
			await User.deleteOne({ _id: isThereBefore._id });
		}
		// Şifreyi hashleyin
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		await User.create({ username, password: hashedPassword, email, verificationToken });
		
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false, // true for port 465, false for others
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASSWORD
			}
		});

		const mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: 'İTÜ Raptiye mail doğrulama',
			html: `<h1>Bizi tercih ettiğiniz için teşekkürler.</h1>
			<p><a href="https://www.ituraptiye.com/verify-email?token=${verificationToken}">Linke tıklayarak mailinizi doğrulayın.</a>
			 <br><br>
			Eğer link çalışmazsa aşağıdaki url'ye gidiniz:
			<br><br>
			&lt;a href=&quot;https://www.ituraptiye.com/verify-email?token=${verificationToken}&quot;&gt;linke tıkla&lt;/a&gt;
			  </p>`
		};

		const info = await transporter.sendMail(mailOptions);

		console.log('Email sent: ' + info.response);

		res.render('register',{ message:"basari"})

	} catch (error) {
		console.error(error);

		// Hatanın türüne göre özel mesaj verin
		if (error.code === 11000) {
		return res
			.status(400)
			.render('register', { message: 'Kullanıcı adı veya e-posta zaten kayıtlı.' });
		}

		res.status(500).render('errorpage', { message: 'Bir hata oluştu. Lütfen tekrar deneyin.' });

	}
})
router.post('/forgotpassword',async (req,res) => {
	try {
		const {email} = req.body;
		const user = await User.findOne({ email: email });
		if(!user){
			return res.status(400).render('errorpage', { message: "Sistemde kayıtlı mail bulunamamıştır." });
		}

		const verificationToken = crypto.randomBytes(32).toString('hex');
		user.verificationToken=verificationToken;
		await user.save();
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false, // true for port 465, false for others
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASSWORD
			}
		});

		const mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: 'İTÜ Raptiye şifre yenileme',
			html: `<a href="https://www.ituraptiye.com/refreshpassword?token=${verificationToken}">Linke tıklayarak şifrenizi sıfırlayınız.</a>`
		};

		const info = await transporter.sendMail(mailOptions);

		console.log('Email sent: ' + info.response);
		res.send('Yenileme isteği gönderildi. <a href="https://webmail.itu.edu.tr/login.php">linke</a> tıklayarak mailinize gidip hesabınızı doğrulayın.');
	} catch (error) {
		res.status(500).send(error);
	}
})
router.get('/refreshpassword',async (req, res) => {
	const { token } = req.query;
	try {
		const user = await User.findOne({ verificationToken: token });
		if (!user) {
		  return res.status(400).send('Invalid token');
		}
		res.render('refreshpassword', { token });
	  } catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	  }
})

router.post('/refreshpassword/:token',async (req, res) => {
	const { token } = req.params;
  	const { password } = req.body;
	const user=await User.findOne({ verificationToken: token });
	  try {
		const hashedPassword = await bcrypt.hash(password, 10);
		user.password = hashedPassword;
		user.verificationToken = null;
		await user.save();
		res.redirect('/');
	  } catch (err) {
		res.status(400).json({ message: "Token geçersiz veya süresi dolmuş" });
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

	res.render('login',{message:"verify"});
});

router.post('/login', async (req, res) => {
	try {
		const { email, password, rememberMe } = req.body;

		const user = await User.findOne({ email });

		if (user) {
			if (!user.isVerified) {
				return res.status(400).render('login', { message: "Lütfen mailinizi doğrulayın." });
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
				return res.status(401).render('login',{message: "Şifreniz hatalı."});
			}
		} else {
			return res.status(401).render('login',{message: "E-Posta adresiniz hatalı"});
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