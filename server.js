const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectToDB = require('./db');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const allMiddlewares = require('./middlewares.js');

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
    maxAge: 24 * 60 * 60 * 1000, //default 1 gün
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  },
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    dbName: 'ituraptiye',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, //default 1 gün 
    autoRemove: 'native'
  })
}))

//auto delete
require('./cleaner.js');
//check login
app.use(allMiddlewares.checkSession);

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


const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port http://localhost:" + port);
})