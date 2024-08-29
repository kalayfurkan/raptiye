const express=require('express');
const app=express();





//for using static files
app.use(express.static('public'));



const port=3000;
app.listen(port,() => {
  console.log("Server is running on port http://localhost:"+port);
  
})