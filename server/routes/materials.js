import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Material from '../models/Material.js';
import protect from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, PPT, and DOC files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Helper function to get file type
const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.pdf') return 'PDF';
    if (ext === '.ppt' || ext === '.pptx') return 'PPT';
    if (ext === '.doc' || ext === '.docx') return 'DOC';
    return 'Other';
};

// @route   GET /api/materials
// @desc    Get all materials
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, type } = req.query;

        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        if (type && type !== 'All') {
            query.type = type;
        }

        const materials = await Material.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: materials.length,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching materials',
            error: error.message
        });
    }
});

// @route   GET /api/materials/:id
// @desc    Get single material
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        res.status(200).json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching material',
            error: error.message
        });
    }
});

// @route   GET /api/materials/download/:id
// @desc    Download a material file
// @access  Public
router.get('/download/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        const filePath = path.join(uploadsDir, material.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Increment download count
        material.downloads += 1;
        await material.save();

        res.download(filePath, material.originalName);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: error.message
        });
    }
});

// @route   POST /api/materials
// @desc    Upload a new material
// @access  Private (Admin only)
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const { title, category } = req.body;

        if (!title || !category) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Please provide title and category'
            });
        }

        const material = await Material.create({
            title,
            type: getFileType(req.file.originalname),
            category,
            size: formatFileSize(req.file.size),
            filePath: req.file.filename,
            originalName: req.file.originalname
        });

        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            data: material
        });
    } catch (error) {
        // Clean up file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading material',
            error: error.message
        });
    }
});

// @route   PUT /api/materials/:id
// @desc    Update a material
// @access  Private (Admin only)
router.put('/:id', protect, upload.single('file'), async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        const { title, category } = req.body;

        const updateData = {
            title: title || material.title,
            category: category || material.category,
            updatedAt: Date.now()
        };

        // If new file uploaded, update file-related fields
        if (req.file) {
            // Delete old file
            const oldFilePath = path.join(uploadsDir, material.filePath);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            updateData.type = getFileType(req.file.originalname);
            updateData.size = formatFileSize(req.file.size);
            updateData.filePath = req.file.filename;
            updateData.originalName = req.file.originalname;
        }

        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Material updated successfully',
            data: updatedMaterial
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: 'Error updating material',
            error: error.message
        });
    }
});

// @route   DELETE /api/materials/:id
// @desc    Delete a material
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Material not found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(uploadsDir, material.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Material.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Material deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting material',
            error: error.message
        });
    }
});

export default router;
