const mongoose=require('mongoose');

const shortTermilanSchema = new mongoose.Schema({
	title: {
	  type: String,
	  required: true,
	  trim: true,
	},
	removalDate: {
	  type: Date,
	  required: true,
	},
	description: {
	  type: String,
	  required: true,
	  trim: true,
	},
	images: {
	  type: [String],
	},
	createdAt: {
	  type: Date,
	  default: Date.now,
	},
	owner:{
		type: String,
	}
  });
  
  const Kisailan = mongoose.model('kisailan', shortTermilanSchema);
  
  module.exports = Kisailan;