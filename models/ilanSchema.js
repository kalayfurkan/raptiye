const mongoose = require('mongoose');

const ilanSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	reachYou: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	images: {
		type: [String],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	owner: {
		type: String,
	}
});

const Ilan = mongoose.model('Ilan', ilanSchema);

module.exports = Ilan;