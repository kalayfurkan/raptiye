const mongoose=require('mongoose');

const kiraodaSchema = new mongoose.Schema({
	title: {
	  type: String,
	  required: true,
	  trim: true,
	},
	searchingFor:{
		type: String,
		required: true,
	},
	description: {
	  type: String,
	  required: true,
	  trim: true,
	},
	reachYou:{
		type: String,
		required:true,
	},
	images: {
	  type: [String],
	},
	createdAt: {
	  type: Date,
	  default: Date.now,
	},
	owner:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	}
  });
  
  const Kiraoda = mongoose.model('kiraoda', kiraodaSchema);
  
  module.exports = Kiraoda;