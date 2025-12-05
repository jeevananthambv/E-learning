import express from 'express';
import Video from '../models/Video.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/videos
// @desc    Get all videos
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { subject } = req.query;

        let query = {};
        if (subject && subject !== 'All') {
            query.subject = subject;
        }

        const videos = await Video.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
});

// @route   GET /api/videos/:id
// @desc    Get single video
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Increment view count
        video.views += 1;
        await video.save();

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching video',
            error: error.message
        });
    }
});

// @route   POST /api/videos
// @desc    Create a new video
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
    try {
        const { title, subject, description, thumbnail, duration, youtubeId } = req.body;

        // Validate required fields
        if (!title || !subject || !youtubeId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, subject, and YouTube ID'
            });
        }

        const video = await Video.create({
            title,
            subject,
            description,
            thumbnail: thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
            duration,
            youtubeId
        });

        res.status(201).json({
            success: true,
            message: 'Video added successfully',
            data: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating video',
            error: error.message
        });
    }
});

// @route   PUT /api/videos/:id
// @desc    Update a video
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, subject, description, thumbnail, duration, youtubeId } = req.body;

        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { title, subject, description, thumbnail, duration, youtubeId, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating video',
            error: error.message
        });
    }
});

// @route   DELETE /api/videos/:id
// @desc    Delete a video
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting video',
            error: error.message
        });
    }
});

export default router;
