const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
	username:{type:String,required:true,trim:true,unique:true},
	password:{type:String,required:true,trim:true},
	email:{type:String,required:true,trim:true,unique:true},
	isVerified: { type: Boolean, default: false },
	verificationToken: { type: String },
	favorites:{type: [String],default:[]},
	info:{type:String,default:""},
	profilePic:{type:String,default:"/img/Default_pfp.svg.png"}
});

const User=mongoose.model("User",userSchema);

module.exports=User;