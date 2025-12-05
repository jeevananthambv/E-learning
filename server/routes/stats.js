import express from 'express';
import Video from '../models/Video.js';
import Material from '../models/Material.js';
import Contact from '../models/Contact.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        // Get counts
        const videoCount = await Video.countDocuments();
        const materialCount = await Material.countDocuments();
        const messageCount = await Contact.countDocuments();
        const unreadMessages = await Contact.countDocuments({ isRead: false });

        // Get total views and downloads
        const videos = await Video.find({}, 'views');
        const materials = await Material.find({}, 'downloads');

        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalDownloads = materials.reduce((sum, material) => sum + (material.downloads || 0), 0);

        // Get recent activity
        const recentVideos = await Video.find().sort({ createdAt: -1 }).limit(5);
        const recentMaterials = await Material.find().sort({ createdAt: -1 }).limit(5);
        const recentMessages = await Contact.find().sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    videos: videoCount,
                    materials: materialCount,
                    messages: messageCount,
                    unreadMessages: unreadMessages
                },
                totals: {
                    views: totalViews,
                    downloads: totalDownloads
                },
                recent: {
                    videos: recentVideos,
                    materials: recentMaterials,
                    messages: recentMessages
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// @route   GET /api/stats/public
// @desc    Get public statistics for homepage
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const videoCount = await Video.countDocuments();
        const materialCount = await Material.countDocuments();

        const videos = await Video.find({}, 'views');
        const materials = await Material.find({}, 'downloads');

        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalDownloads = materials.reduce((sum, material) => sum + (material.downloads || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                videos: videoCount,
                materials: materialCount,
                views: totalViews,
                downloads: totalDownloads
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

export default router;
