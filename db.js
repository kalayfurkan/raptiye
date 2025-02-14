const mongoose = require('mongoose');

const connectToDB = () => {
	mongoose.connect(process.env.DB_URI, {
		dbName: "ituraptiye",
	}).then(() => {
	}).catch((err) => {
		console.error("DB connection error: " + err);
	});
};

module.exports = connectToDB;