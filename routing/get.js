const express = require('express');
const router = express.Router();
const allMiddlewares = require('../middlewares.js');

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
router.get('/satis-ilani-ekle', allMiddlewares.requireAuth, (req, res) => {
	res.render('satis-ilani-ekle');
});
router.get('/errorpage', (req, res) => {
	res.render('errorpage');
});

router.get('/listsearchresult', allMiddlewares.requireAuth, (req, res) => {
	res.render('listsearchresult');
});
router.get('/register', (req, res) => {
	res.render('register');
});

//Ömer done that
router.get('/harfnotuhesapla', (req, res) => {
	res.render('harfnotuhesapla');
});

//Ömer on it again
router.get('/hakkimizda', (req, res) => {
	res.render('hakkimizda');
});

module.exports = router;