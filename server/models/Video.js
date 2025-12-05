import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['Data Structures', 'Programming', 'DBMS', 'Algorithms', 'Operating Systems', 'Networking', 'Other']
    },
    description: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        default: '00:00'
    },
    youtubeId: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt on save
videoSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
