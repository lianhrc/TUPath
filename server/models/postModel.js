const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const voteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vote: {
        type: String,
        enum: ['like', 'dislike'],
        required: false
    }
});

const commentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    }
});

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postContent: {
        type: String,
        required: false
    },
    media: {
        type: String,
        required: false
    },
    votedUsers: [voteSchema], // Changed from an object to an array of voteSchema
    comments: [commentSchema] // Kept as an array
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
