const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectToDB = require('./db');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const allMiddlewares = require('./middlewares.js');

app.set('trust proxy', true);

//to use dotenv
dotenv.config();

//connection for db
connectToDB();

//session
app.use(expressSession({
  secret: process.env.session_secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 6 * 60 * 60 * 1000, //default 6 saat
    httpOnly: true,  //https only için değişimler yapılmalı
    secure: false,//process.env.NODE_ENV === 'production', ya da sadece http ile ulaşılması için yayınlamadan true yapmalıyız
    sameSite: 'strict', //sameSite: 'lax'
  },
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    dbName: 'ituraptiye',
    collectionName: 'sessions',
    ttl: 6 * 60 * 60, //default 6 saat 
    autoRemove: 'native'
  })
}))

//flash message middleware


app.use((req, res, next) => {
  res.locals.sessionFlash = req.session.sessionFlash
  delete req.session.sessionFlash
  next()
})

//auto delete
require('./cleaner.js');
//check login
app.use(allMiddlewares.checkSession);
//notification middleware
app.use(allMiddlewares.isThereNotification);

//to set view engine as ejs
app.set('view engine', 'ejs');

//to use static files
app.use(express.static('public'));


//to get req.body 
app.use(express.json());

// URL-encoded for html forms
app.use(express.urlencoded({ extended: true }));

//file upload
app.use(fileUpload());

//for routing
const mainRouter = require('./routing/mainRouter');
app.use('/', mainRouter);



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is running on port http://localhost:" + port);
})