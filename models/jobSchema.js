const mongoose=require('mongoose');

const jobSchema = new mongoose.Schema({
	jobTitle: {
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
  
  const Job = mongoose.model('Job', jobSchema);
  
  module.exports = Job;