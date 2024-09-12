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
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	}
  });
  
  const Kisailan = mongoose.model('kisailan', shortTermilanSchema);
  
  module.exports = Kisailan;