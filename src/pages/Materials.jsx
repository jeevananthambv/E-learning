import { useState, useEffect } from 'react';
import './Materials.css';
import { materialsAPI } from '../api';

const categories = ['All', 'Data Structures', 'Programming', 'DBMS', 'Algorithms', 'Operating Systems', 'Networking'];
const fileTypes = ['All', 'PDF', 'PPT', 'DOC'];

// Icon and color mapping
const getIconAndColor = (type) => {
    switch (type) {
        case 'PDF':
            return { icon: '📄', color: '#e74c3c' };
        case 'PPT':
            return { icon: '📊', color: '#e67e22' };
        case 'DOC':
            return { icon: '📝', color: '#3498db' };
        default:
            return { icon: '📁', color: '#9b59b6' };
    }
};

const Materials = () => {
    const [materialsData, setMaterialsData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch materials from backend
    useEffect(() => {
        fetchMaterials();
    }, [selectedCategory, selectedType]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await materialsAPI.getAll(selectedCategory, selectedType);
            if (response.success) {
                setMaterialsData(response.data);
            }
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError('Failed to load materials. Please try again later.');
            setMaterialsData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (material) => {
        window.open(materialsAPI.getDownloadUrl(material._id), '_blank');
    };

    const handlePreview = (material) => {
        // For PDFs, open in new tab
        if (material.type === 'PDF') {
            window.open(materialsAPI.getDownloadUrl(material._id), '_blank');
        } else {
            alert('Preview is only available for PDF files. Click Download to get the file.');
        }
    };

    return (
        <div className="materials-page page-content">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Study Materials</h1>
                    <p>Download comprehensive study materials, notes, and presentations</p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="filter-section">
                <div className="container">
                    <div className="filters-wrapper">
                        <div className="filter-group">
                            <label>Category:</label>
                            <div className="filter-tabs">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-group filter-type">
                            <label>Type:</label>
                            <div className="filter-tabs">
                                {fileTypes.map((type) => (
                                    <button
                                        key={type}
                                        className={`filter-tab ${selectedType === type ? 'active' : ''}`}
                                        onClick={() => setSelectedType(type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Materials List */}
            <section className="section">
                <div className="container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading materials...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchMaterials}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="materials-list">
                                {materialsData.map((material) => {
                                    const { icon, color } = getIconAndColor(material.type);
                                    return (
                                        <div key={material._id} className="material-item card">
                                            <div className="material-icon-wrapper" style={{ background: `${color}15` }}>
                                                <span className="material-type-icon" style={{ color: color }}>
                                                    {icon}
                                                </span>
                                            </div>
                                            <div className="material-content">
                                                <div className="material-main">
                                                    <h3 className="material-title">{material.title}</h3>
                                                    <div className="material-meta">
                                                        <span className="material-category">{material.category}</span>
                                                        <span className="material-dot">•</span>
                                                        <span className="material-type-label">{material.type}</span>
                                                        <span className="material-dot">•</span>
                                                        <span className="material-size">{material.size}</span>
                                                    </div>
                                                </div>
                                                <div className="material-actions">
                                                    <button
                                                        className="btn btn-outline material-action-btn"
                                                        onClick={() => handlePreview(material)}
                                                    >
                                                        👁 Preview
                                                    </button>
                                                    <button
                                                        className="btn btn-primary material-action-btn"
                                                        onClick={() => handleDownload(material)}
                                                    >
                                                        ⬇ Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {materialsData.length === 0 && (
                                <div className="no-results">
                                    <p>No materials found matching your criteria.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Materials;
