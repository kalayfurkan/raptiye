const express = require('express');
const router = express.Router();
const allMiddlewares=require('../middlewares.js');

router.get('/', (req, res) => {
	console.log(req.session);
	res.render('home');
})
router.get('/login', (req, res) => {
	res.render('login');
});
router.get('/addpost',allMiddlewares.requireAuth, (req, res) => {
	res.render('addpost');
});
router.get('/errorpage', (req, res) => {
	res.render('errorpage');
});

router.get('/listsearchresult',allMiddlewares.requireAuth, (req, res) => {
	res.render('listsearchresult');
});
router.get('/register', (req, res) => {
	res.render('register');
});

//Ömer done that
router.get('/lettergrade', (req, res) => {
	res.render('lettergrade');
  });

module.exports = router;