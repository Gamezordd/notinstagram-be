const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  displayName: String,
  password: String,
  salt: String,
  userId: Number,
});

module.exports = mongoose.model('User', UserSchema, 'users');