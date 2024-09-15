const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	texts: [{
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // mesaj gönderen
		content: { type: String, required: true }, // mesajın içeriği
		timestamp: { type: Date, default: Date.now }, // gönderim zamanı
	}],
	communicators: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	}],
	createdAt: { type: Date, default: Date.now, expires: '7d' }
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;