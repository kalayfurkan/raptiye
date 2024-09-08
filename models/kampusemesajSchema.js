const mongoose=require('mongoose');

const kampusemesajSchema = new mongoose.Schema({
	mesaj: {
	  type: String,
	  required: true,
	  trim: true,
	},
	createdAt: {
	  type: Date,
	  default: Date.now,
	},
	owner:{
		type: String,
	},
	upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
  });
  
  const Kampusemesaj = mongoose.model('kampusemesaj', kampusemesajSchema);
  
  module.exports = Kampusemesaj;