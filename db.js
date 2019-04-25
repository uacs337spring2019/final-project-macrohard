const mongoose = require("mongoose");
const connString = "mongodb+srv://cMessage:O3kZ9vNMVn3f3vm5@337final-vl3my.azure.mongodb.net/test?retryWrites=true";

mongoose.connect(connString, { useNewUrlParser: true });
module.exports = mongoose;