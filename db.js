const mongoose = require('mongoose');

const connectToDB = () => {
	mongoose.connect(process.env.DB_URI, {
		dbName: "ituraptiye",
	}).then(() => {
		console.log("Connection to DB is successful");
	}).catch((err) => {
		console.log("DB connection error: " + err);
	});
};

module.exports = connectToDB;