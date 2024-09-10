const mongoose=require('mongoose');
const bcrypt = require('bcrypt');

const userSchema=new mongoose.Schema({
	username:{type:String,required:true,trim:true,unique:true},
	password:{type:String,required:true,trim:true},
	email:{type:String,required:true,trim:true,unique:true},
	isVerified: { type: Boolean, default: false },
	verificationToken: { type: String },
	favorites:{type: [String]}
});



userSchema.pre("save",function(next){
	const user=this;

	if (!user.isModified('password')) {
        return next();
    }
	
	bcrypt.hash(user.password,10,(err,hash) => {
	  user.password=hash;
	  next();
	})
})

const User=mongoose.model("User",userSchema);

module.exports=User;