const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectToDB = require('./db');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo');

//to use dotenv
dotenv.config();

//connection for db
connectToDB();

//session
app.use(expressSession({
  secret:process.env.session_secret,
  resave:false,
  saveUninitialized:false,
   cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  },
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    dbName: 'ituraptiye',
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
    autoRemove: 'native'
  })
}))

//to set view engine as ejs
app.set('view engine', 'ejs');

//to use static files
app.use(express.static('public'));

//to get req.body 
app.use(express.json());

// URL-encoded for html forms
app.use(express.urlencoded({ extended: true }));

//for routing
const mainRouter=require('./routing/mainRouter');
app.use('/',mainRouter);


const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port http://localhost:" + port);
})