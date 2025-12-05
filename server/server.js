import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import materialRoutes from './routes/materials.js';
import contactRoutes from './routes/contact.js';
import statsRoutes from './routes/stats.js';

// Import User model for seeding
import User from './models/User.js';
import Video from './models/Video.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Faculty E-Content Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Faculty E-Content API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            videos: '/api/videos',
            materials: '/api/materials',
            contact: '/api/contact',
            stats: '/api/stats'
        }
    });
});

// Seed initial admin user and sample data
const seedDatabase = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@university.edu' });

        if (!adminExists) {
            await User.create({
                email: process.env.ADMIN_EMAIL || 'admin@university.edu',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                name: 'Madhankumar C'
            });
            console.log('✅ Default admin user created');
            console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@university.edu');
            console.log('   Password:', process.env.ADMIN_PASSWORD || 'admin123');
        }

        // Check if sample videos exist
        const videoCount = await Video.countDocuments();
        if (videoCount === 0) {
            const sampleVideos = [
                {
                    title: 'Introduction to Data Structures',
                    subject: 'Data Structures',
                    description: 'Learn the fundamentals of data structures including arrays, linked lists, and their applications.',
                    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
                    duration: '45:30',
                    youtubeId: 'dQw4w9WgXcQ'
                },
                {
                    title: 'Object Oriented Programming Basics',
                    subject: 'Programming',
                    description: 'Understanding OOP concepts like classes, objects, inheritance, and polymorphism.',
                    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
                    duration: '38:15',
                    youtubeId: 'dQw4w9WgXcQ'
                },
                {
                    title: 'Database Management Systems',
                    subject: 'DBMS',
                    description: 'Comprehensive overview of database concepts, SQL, and normalization techniques.',
                    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=225&fit=crop',
                    duration: '52:00',
                    youtubeId: 'dQw4w9WgXcQ'
                },
                {
                    title: 'Algorithm Analysis',
                    subject: 'Algorithms',
                    description: 'Learn how to analyze algorithm complexity and optimize your code for better performance.',
                    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop',
                    duration: '41:20',
                    youtubeId: 'dQw4w9WgXcQ'
                },
                {
                    title: 'Operating Systems Concepts',
                    subject: 'Operating Systems',
                    description: 'Understanding process management, memory management, and file systems.',
                    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
                    duration: '55:45',
                    youtubeId: 'dQw4w9WgXcQ'
                },
                {
                    title: 'Computer Networks Fundamentals',
                    subject: 'Networking',
                    description: 'Learn about OSI model, TCP/IP, routing, and network security basics.',
                    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop',
                    duration: '48:30',
                    youtubeId: 'dQw4w9WgXcQ'
                }
            ];

            await Video.insertMany(sampleVideos);
            console.log('✅ Sample videos created');
        }

    } catch (error) {
        console.error('Error seeding database:', error.message);
    }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-econtent')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Seed database with initial data
        await seedDatabase();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('\n📋 To fix this:');
        console.log('1. Install MongoDB locally, OR');
        console.log('2. Use MongoDB Atlas (cloud) and update MONGODB_URI in .env file');
        console.log('\nStarting server without database connection...\n');

        // Start server anyway for testing
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT} (No DB)`);
        });
    });

export default app;
