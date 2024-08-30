const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('home');
})
router.get('/login', (req, res) => {
	res.render('login');
});
router.get('/addpost', (req, res) => {
	res.render('addpost');
});
router.get('/errorpage', (req, res) => {
	res.render('errorpage');
});
router.get('/list', (req, res) => {
	res.render('list');
});
router.get('/list-ilanlar', (req, res) => {
	res.render('list-ilanlar');
});
router.get('/listsearchresult', (req, res) => {
	res.render('listsearchresult');
});
router.get('/profile', (req, res) => {
	res.render('profile');
});
router.get('/register', (req, res) => {
	res.render('register');
});

module.exports = router;