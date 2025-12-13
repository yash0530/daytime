import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { API_URL } from '../config';
import ConfirmDialog from '../components/ConfirmDialog';

const JournalList = () => {
    const navigate = useNavigate();
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/journals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJournals(data);
            }
        } catch (err) {
            console.error('Error fetching journals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e, journal) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteTarget(journal);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/journals/${deleteTarget._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setJournals(prev => prev.filter(j => j._id !== deleteTarget._id));
                setDeleteTarget(null);
            }
        } catch (err) {
            console.error('Error deleting journal:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setDeleteTarget(null);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="journal-list-page" style={pageStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>Journal Entries</h1>
                <button onClick={() => navigate('/')} style={backBtnStyle}>
                    ← Back to Dashboard
                </button>
            </header>

            {loading ? (
                <div style={loadingStyle}>
                    <div style={spinnerStyle}></div>
                    Loading journals...
                </div>
            ) : journals.length === 0 ? (
                <div style={emptyStyle}>
                    No journal entries yet. Go back to the dashboard and create your first entry!
                </div>
            ) : (
                <div className="journals-grid" style={gridStyle}>
                    {journals.map(journal => (
                        <div key={journal._id} className="journal-card" style={cardStyle}>
                            <div style={cardHeader}>
                                <span style={dateStyle}>{formatDate(journal.createdAt)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {journal.category && (
                                        <span style={categoryBadge}>{journal.category}</span>
                                    )}
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteClick(e, journal)}
                                        aria-label="Delete journal"
                                        title="Delete journal"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p style={contentStyle}>{journal.content}</p>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteTarget !== null}
                title="Delete Journal Entry"
                message={`Are you sure you want to delete this journal entry? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
            />
        </div>
    );
};

// Styles matching Visualization page
const pageStyle = {
    padding: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh'
};

const headerStyle = {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
};

const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0
};

const backBtnStyle = {
    padding: '10px 20px',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500'
};

const loadingStyle = {
    textAlign: 'center',
    padding: '80px',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
};

const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
};

const emptyStyle = {
    textAlign: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)'
};

const gridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.2s ease'
};

const cardHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px'
};

const dateStyle = {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)'
};

const categoryBadge = {
    fontSize: '0.75rem',
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(102, 126, 234, 0.15)',
    color: '#667eea',
    fontWeight: '500'
};

const contentStyle = {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'rgba(255,255,255,0.85)',
    whiteSpace: 'pre-wrap',
    margin: 0
};

export default JournalList;

