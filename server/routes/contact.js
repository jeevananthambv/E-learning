import express from 'express';
import Contact from '../models/Contact.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        const contact = await Contact.create({
            name,
            email,
            subject: subject || 'No Subject',
            message
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully! We will get back to you soon.',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
});

// @route   PUT /api/contact/:id/read
// @desc    Mark a message as read
// @access  Private (Admin only)
router.put('/:id/read', protect, async (req, res) => {
    try {
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating message',
            error: error.message
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
});

export default router;
