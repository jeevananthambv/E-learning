import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PDF', 'PPT', 'DOC']
    },
    category: {
        type: String,
        required: true,
        enum: ['Data Structures', 'Programming', 'DBMS', 'Algorithms', 'Operating Systems', 'Networking', 'Other']
    },
    size: {
        type: String,
        default: '0 KB'
    },
    filePath: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    downloads: {
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
materialSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Material = mongoose.model('Material', materialSchema);

export default Material;
