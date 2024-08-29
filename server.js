const express=require('express');
const app=express();
const dotenv=require('dotenv');
const connectToDB=require('./db');

//to use dotenv
dotenv.config();

//connection for db
connectToDB();





//for setting view engine as ejs
app.set('view engine','ejs');

//for using static files
app.use(express.static('public'));

app.get('/',(req,res) => {
  res.send('hello');
})

const port=3000;
app.listen(port,() => {
  console.log("Server is running on port http://localhost:"+port);
  
})