const mongoose = require("mongoose");
const { reactionsEnum } = require("./helpers/enums");
const {ObjectId, Array, } = require('mongoose').Types;

const PostSchema = new mongoose.Schema({
  textContent: String,
  userId: mongoose.Schema.Types.ObjectId,
  reactions:{
    type: [{reaction: {
      type: String,
      enum: reactionsEnum,
    }, useId: ObjectId}],
    default: []
  },
  comments: {
    type: [{userId: ObjectId, text: String}],
    default: [],
  },
  reactionCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: new Date().getTime(),
  }
});

module.exports = mongoose.model('Post', PostSchema, 'posts');