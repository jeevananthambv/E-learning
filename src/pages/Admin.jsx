import { useState, useEffect } from 'react';
import './Admin.css';
import { authAPI, videosAPI, materialsAPI, contactAPI, statsAPI, getToken } from '../api';

const Admin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Dashboard data
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form data
    const [videoForm, setVideoForm] = useState({
        title: '', subject: '', description: '', youtubeId: '', thumbnail: '', duration: ''
    });
    const [materialForm, setMaterialForm] = useState({
        title: '', category: '', file: null
    });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });

    // Check if already logged in
    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (token) {
                try {
                    await authAPI.verify();
                    setIsLoggedIn(true);
                    fetchDashboardData();
                } catch {
                    authAPI.logout();
                }
            }
        };
        checkAuth();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, videosRes, materialsRes, messagesRes] = await Promise.all([
                statsAPI.getAdmin(),
                videosAPI.getAll(),
                materialsAPI.getAll(),
                contactAPI.getAll()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (videosRes.success) setVideos(videosRes.data);
            if (materialsRes.success) setMaterials(materialsRes.data);
            if (messagesRes.success) setMessages(messagesRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const response = await authAPI.login(loginData.email, loginData.password);
            if (response.success) {
                setIsLoggedIn(true);
                fetchDashboardData();
            }
        } catch (err) {
            setLoginError(err.message || 'Invalid credentials');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        setIsLoggedIn(false);
        setLoginData({ email: '', password: '' });
        setStats(null);
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        setFormMessage({ type: '', text: '' });

        try {
            const response = await videosAPI.create(videoForm);
            if (response.success) {
                setFormMessage({ type: 'success', text: 'Video added successfully!' });
                setVideoForm({ title: '', subject: '', description: '', youtubeId: '', thumbnail: '', duration: '' });
                fetchDashboardData();
            }
        } catch (err) {
            setFormMessage({ type: 'error', text: err.message || 'Failed to add video' });
        }
    };

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        setFormMessage({ type: '', text: '' });

        if (!materialForm.file) {
            setFormMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', materialForm.title);
            formData.append('category', materialForm.category);
            formData.append('file', materialForm.file);

            const response = await materialsAPI.create(formData);
            if (response.success) {
                setFormMessage({ type: 'success', text: 'Material uploaded successfully!' });
                setMaterialForm({ title: '', category: '', file: null });
                // Reset file input
                document.getElementById('material-file').value = '';
                fetchDashboardData();
            }
        } catch (err) {
            setFormMessage({ type: 'error', text: err.message || 'Failed to upload material' });
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;
        try {
            await videosAPI.delete(id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete video: ' + err.message);
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await materialsAPI.delete(id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete material: ' + err.message);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await contactAPI.delete(id);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete message: ' + err.message);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await contactAPI.markAsRead(id);
            fetchDashboardData();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-page page-content">
                <section className="login-section">
                    <div className="login-card card">
                        <div className="login-header">
                            <span className="login-icon">🔐</span>
                            <h2>Admin Login</h2>
                            <p>Sign in to manage your e-content portal</p>
                        </div>
                        <form onSubmit={handleLogin} className="login-form">
                            {loginError && (
                                <div className="login-error">
                                    {loginError}
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    placeholder="admin@university.edu"
                                    required
                                    disabled={loginLoading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loginLoading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-login" disabled={loginLoading}>
                                {loginLoading ? '⏳ Signing In...' : 'Sign In'}
                            </button>
                        </form>
                        <p className="login-hint">
                            Default: admin@university.edu / admin123
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="admin-page page-content">
            {/* Admin Header */}
            <section className="admin-header">
                <div className="container">
                    <div className="admin-header-content">
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Manage your videos, materials, and messages</p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </section>

            {/* Dashboard Content */}
            <section className="section admin-dashboard">
                <div className="container">
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card card">
                            <span className="stat-icon">🎬</span>
                            <div className="stat-info">
                                <span className="stat-number">{stats?.counts?.videos || 0}</span>
                                <span className="stat-label">Total Videos</span>
                            </div>
                        </div>
                        <div className="stat-card card">
                            <span className="stat-icon">📄</span>
                            <div className="stat-info">
                                <span className="stat-number">{stats?.counts?.materials || 0}</span>
                                <span className="stat-label">Study Materials</span>
                            </div>
                        </div>
                        <div className="stat-card card">
                            <span className="stat-icon">👁</span>
                            <div className="stat-info">
                                <span className="stat-number">{stats?.totals?.views?.toLocaleString() || 0}</span>
                                <span className="stat-label">Total Views</span>
                            </div>
                        </div>
                        <div className="stat-card card">
                            <span className="stat-icon">📨</span>
                            <div className="stat-info">
                                <span className="stat-number">{stats?.counts?.unreadMessages || 0}</span>
                                <span className="stat-label">Unread Messages</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="admin-tabs">
                        <button
                            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            className={`admin-tab ${activeTab === 'videos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('videos')}
                        >
                            🎬 Videos
                        </button>
                        <button
                            className={`admin-tab ${activeTab === 'materials' ? 'active' : ''}`}
                            onClick={() => setActiveTab('materials')}
                        >
                            📄 Materials
                        </button>
                        <button
                            className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            📨 Messages {stats?.counts?.unreadMessages > 0 && (
                                <span className="badge">{stats.counts.unreadMessages}</span>
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-content">
                            <div className="dashboard-grid">
                                <div className="dashboard-section card">
                                    <h3>Recent Videos</h3>
                                    {videos.slice(0, 5).map(video => (
                                        <div key={video._id} className="dashboard-item">
                                            <span>{video.title}</span>
                                            <span className="item-meta">{video.views} views</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="dashboard-section card">
                                    <h3>Recent Messages</h3>
                                    {messages.slice(0, 5).map(msg => (
                                        <div key={msg._id} className={`dashboard-item ${!msg.isRead ? 'unread' : ''}`}>
                                            <span>{msg.name}</span>
                                            <span className="item-meta">{msg.subject || 'No Subject'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'videos' && (
                        <div className="upload-section card">
                            <form className="upload-form" onSubmit={handleVideoSubmit}>
                                <h3>Add New Video</h3>
                                {formMessage.text && (
                                    <div className={`form-message ${formMessage.type}`}>
                                        {formMessage.text}
                                    </div>
                                )}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Video Title *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter video title"
                                            value={videoForm.title}
                                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject/Category *</label>
                                        <select
                                            value={videoForm.subject}
                                            onChange={(e) => setVideoForm({ ...videoForm, subject: e.target.value })}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option>Data Structures</option>
                                            <option>Programming</option>
                                            <option>DBMS</option>
                                            <option>Algorithms</option>
                                            <option>Operating Systems</option>
                                            <option>Networking</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter video description"
                                        rows="3"
                                        value={videoForm.description}
                                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>YouTube Video ID *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., dQw4w9WgXcQ"
                                            value={videoForm.youtubeId}
                                            onChange={(e) => setVideoForm({ ...videoForm, youtubeId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 45:30"
                                            value={videoForm.duration}
                                            onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="upload-actions">
                                    <button type="submit" className="btn btn-primary">
                                        ➕ Add Video
                                    </button>
                                </div>
                            </form>

                            {/* Video List */}
                            <div className="content-list">
                                <h3>Manage Videos ({videos.length})</h3>
                                {videos.map(video => (
                                    <div key={video._id} className="content-item">
                                        <div className="content-info">
                                            <strong>{video.title}</strong>
                                            <span>{video.subject} • {video.views} views</span>
                                        </div>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteVideo(video._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="upload-section card">
                            <form className="upload-form" onSubmit={handleMaterialSubmit}>
                                <h3>Upload New Material</h3>
                                {formMessage.text && (
                                    <div className={`form-message ${formMessage.type}`}>
                                        {formMessage.text}
                                    </div>
                                )}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Material Title *</label>
                                        <input
                                            type="text"
                                            placeholder="Enter material title"
                                            value={materialForm.title}
                                            onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            value={materialForm.category}
                                            onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            <option>Data Structures</option>
                                            <option>Programming</option>
                                            <option>DBMS</option>
                                            <option>Algorithms</option>
                                            <option>Operating Systems</option>
                                            <option>Networking</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>File Upload *</label>
                                    <input
                                        type="file"
                                        id="material-file"
                                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                                        onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                                        required
                                    />
                                </div>
                                <div className="upload-actions">
                                    <button type="submit" className="btn btn-primary">
                                        ➕ Upload Material
                                    </button>
                                </div>
                            </form>

                            {/* Material List */}
                            <div className="content-list">
                                <h3>Manage Materials ({materials.length})</h3>
                                {materials.map(material => (
                                    <div key={material._id} className="content-item">
                                        <div className="content-info">
                                            <strong>{material.title}</strong>
                                            <span>{material.category} • {material.type} • {material.size}</span>
                                        </div>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteMaterial(material._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="messages-section card">
                            <h3>Contact Messages ({messages.length})</h3>
                            {messages.length === 0 ? (
                                <p className="no-messages">No messages yet.</p>
                            ) : (
                                <div className="messages-list">
                                    {messages.map(msg => (
                                        <div key={msg._id} className={`message-item ${!msg.isRead ? 'unread' : ''}`}>
                                            <div className="message-header">
                                                <div className="message-sender">
                                                    <strong>{msg.name}</strong>
                                                    <span>{msg.email}</span>
                                                </div>
                                                <div className="message-date">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="message-subject">
                                                <strong>Subject:</strong> {msg.subject || 'No Subject'}
                                            </div>
                                            <div className="message-body">
                                                {msg.message}
                                            </div>
                                            <div className="message-actions">
                                                {!msg.isRead && (
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => handleMarkAsRead(msg._id)}
                                                    >
                                                        ✓ Mark as Read
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Admin;
