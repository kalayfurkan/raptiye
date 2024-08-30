const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectToDB = require('./db');

//to use dotenv
dotenv.config();

//connection for db
connectToDB();


//to set view engine as ejs
app.set('view engine', 'ejs');

//to use static files
app.use(express.static('public'));

//to get req.body 
app.use(express.json());

//for routing
const mainRouter=require('./routing/mainRouter');
app.use('/',mainRouter);


const port = 3000;
app.listen(port, () => {
  console.log("Server is running on port http://localhost:" + port);
})