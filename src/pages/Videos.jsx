import { useState, useEffect } from 'react';
import './Videos.css';
import { videosAPI } from '../api';

const subjects = ['All', 'Data Structures', 'Programming', 'DBMS', 'Algorithms', 'Operating Systems', 'Networking'];

const Videos = () => {
    const [videosData, setVideosData] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch videos from backend
    useEffect(() => {
        fetchVideos();
    }, [selectedSubject]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await videosAPI.getAll(selectedSubject);
            if (response.success) {
                setVideosData(response.data);
            }
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again later.');
            // Fallback to empty array
            setVideosData([]);
        } finally {
            setLoading(false);
        }
    };

    const openVideoModal = async (video) => {
        setSelectedVideo(video);
        // Track view
        try {
            await videosAPI.getOne(video._id);
        } catch (err) {
            console.error('Error tracking view:', err);
        }
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
    };

    return (
        <div className="videos-page page-content">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Video Lectures</h1>
                    <p>Explore our collection of comprehensive video tutorials and lectures</p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="filter-section">
                <div className="container">
                    <div className="filter-tabs">
                        {subjects.map((subject) => (
                            <button
                                key={subject}
                                className={`filter-tab ${selectedSubject === subject ? 'active' : ''}`}
                                onClick={() => setSelectedSubject(subject)}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Videos Grid */}
            <section className="section">
                <div className="container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading videos...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchVideos}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="videos-grid-page">
                                {videosData.map((video) => (
                                    <div key={video._id} className="video-card-full card" onClick={() => openVideoModal(video)}>
                                        <div className="video-thumbnail">
                                            <img src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`} alt={video.title} />
                                            <div className="video-overlay">
                                                <button className="play-btn">▶</button>
                                            </div>
                                            <span className="video-duration">{video.duration}</span>
                                        </div>
                                        <div className="video-details">
                                            <span className="video-subject">{video.subject}</span>
                                            <h3 className="video-title">{video.title}</h3>
                                            <p className="video-description">{video.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {videosData.length === 0 && (
                                <div className="no-results">
                                    <p>No videos found in this category.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="video-modal" onClick={closeVideoModal}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeVideoModal}>✕</button>
                        <div className="video-player">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="modal-info">
                            <h2>{selectedVideo.title}</h2>
                            <span className="modal-subject">{selectedVideo.subject}</span>
                            <p>{selectedVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Videos;
