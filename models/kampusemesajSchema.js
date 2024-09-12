const mongoose=require('mongoose');

const yorumSchema = new mongoose.Schema({
	yorum: {
	  type: String,
	  required: true,
	  trim: true,
	},
	owner: {
	  type: mongoose.Schema.Types.ObjectId,
	  ref: 'User',  // Yorumu yazan kişi
	  required: true,
	},
	createdAt: {
	  type: Date,
	  default: Date.now,
	},
  });

const kampusemesajSchema = new mongoose.Schema({
	mesaj: {
	  type: String,
	  required: true,
	  trim: true,
	},
	createdAt: {
	  type: Date,
	  default: Date.now,
	  expires: 604800,
	},
	owner:{
		type: String,
	},
	upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
	upVoters:{
		type: [String],
		default: []

	},
	downVoters:{
		type: [String],
		default: []
	},
	yorumlar: [yorumSchema]
  });
  
  const Kampusemesaj = mongoose.model('kampusemesaj', kampusemesajSchema);
  
  module.exports = Kampusemesaj;