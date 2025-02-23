const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Simplified voteSchema to only track likes
const voteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

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
})

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
    likedUsers: [voteSchema], // Renamed to reflect only likes
    comments: [commentSchema]
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema)