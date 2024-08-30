const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectToDB = require('./db');

//to use dotenv
dotenv.config();

//connection for db
connectToDB();


//for setting view engine as ejs
app.set('view engine', 'ejs');

//for using static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('home');
})
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/addpost', (req, res) => {
  res.render('addpost');
});
app.get('/errorpage', (req, res) => {
  res.render('errorpage');
});
app.get('/list', (req, res) => {
  res.render('list');
});
app.get('/list-ilanlar', (req, res) => {
  res.render('list-ilanlar');
});
app.get('/listsearchresult', (req, res) => {
  res.render('listsearchresult');
});
app.get('/profile', (req, res) => {
  res.render('profile');
});
app.get('/register', (req, res) => {
  res.render('register');
});


const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port http://localhost:" + port);
})