const mongoose = require('mongoose');

// Likes and dislikes store who acted and when the action occurred.
const interactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Comments have their own identifier and include the written text.
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500
  },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    // The brief allows one post to belong to one or more of four topics.
    topics: [
      {
        type: String,
        enum: ['Politics', 'Health', 'Sport', 'Tech'],
        required: true
      }
    ],
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerName: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    likes: { type: [interactionSchema], default: [] },
    dislikes: { type: [interactionSchema], default: [] },
    comments: { type: [commentSchema], default: [] }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual values are calculated when data is returned; they are not duplicated in MongoDB.
postSchema.virtual('status').get(function status() {
  return new Date() >= this.expiresAt ? 'Expired' : 'Live';
});
postSchema.virtual('likeCount').get(function likeCount() {
  return this.likes.length;
});
postSchema.virtual('dislikeCount').get(function dislikeCount() {
  return this.dislikes.length;
});
postSchema.virtual('interestScore').get(function interestScore() {
  return this.likes.length + this.dislikes.length;
});

module.exports = mongoose.model('Post', postSchema);
