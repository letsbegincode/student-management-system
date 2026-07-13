import { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlineClipboardList, 
  HiOutlinePlusCircle, 
  HiOutlinePencilAlt, 
  HiOutlineTrash 
} from 'react-icons/hi';
import PageWrapper from '../components/Layout/PageWrapper';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function ActivityLog() {
  const toast = useToast();
  
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getActivityLogs({ page, limit: 15, action: actionFilter, startDate, endDate });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, startDate, endDate, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Generate pagination buttons
  const renderPagination = () => {
    const { totalPages = 1, page: currentPage = 1, total = 0 } = pagination;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => setPage(1)}>1</button>
      );
      if (start > 2) pages.push(<span key="e1" className="pagination-ellipsis">…</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="e2" className="pagination-ellipsis">…</span>);
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => setPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={!pagination.hasPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ‹
        </button>
        {pages}
        <button
          className="pagination-btn"
          disabled={!pagination.hasNext}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          ›
        </button>
        <span className="pagination-info">
          {total} log{total !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <HiOutlinePlusCircle className="log-icon log-create" />;
      case 'UPDATE': return <HiOutlinePencilAlt className="log-icon log-update" />;
      case 'DELETE': return <HiOutlineTrash className="log-icon log-delete" />;
      default: return <HiOutlineClipboardList className="log-icon" />;
    }
  };

  const formatChanges = (changes) => {
    if (!changes) return null;
    
    let parsedChanges = changes;
    if (typeof changes === 'string') {
      try {
        parsedChanges = JSON.parse(changes);
      } catch (e) {
        return null;
      }
    }
    
    if (Object.keys(parsedChanges).length === 0) return null;
    
    // Check if it's a creation payload (no from/to)
    const isCreation = !Object.values(parsedChanges).some(c => c && typeof c === 'object' && 'to' in c);
    
    if (isCreation) {
      return (
        <div className="log-details-grid">
          {Object.entries(parsedChanges).map(([key, val]) => (
            <div key={key} className="log-detail-badge">
              <span className="log-detail-key">{key}:</span> {String(val)}
            </div>
          ))}
        </div>
      );
    }
    
    // It's an update with from/to
    return (
      <div className="log-changes-list">
        {Object.entries(parsedChanges).map(([key, diff]) => {
          if (diff === 'Updated') {
            return (
              <div key={key} className="log-change-item">
                <span className="log-change-field">{key}</span> updated
              </div>
            );
          }
          return (
            <div key={key} className="log-change-item">
              <span className="log-change-field">{key}:</span>
              <span className="log-change-from">{String(diff.from || 'none')}</span>
              <span className="log-change-arrow">→</span>
              <span className="log-change-to">{String(diff.to || 'none')}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageWrapper
      title="Activity Log"
      description="Track all system actions and modifications."
    >
      <div className="list-toolbar glass" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Filter Logs:</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>From</span>
            <input 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>To</span>
            <input 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            />
          </div>
          
          <select 
            className="form-select" 
            value={actionFilter} 
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            style={{ width: '150px' }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>

          {(startDate || endDate || actionFilter) && (
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setStartDate(''); setEndDate(''); setActionFilter(''); setPage(1); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: 'var(--space-2)' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No activity logs yet</div>
            <div className="empty-state-text">Actions like adding or updating students will appear here.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div className="timeline-container">
              {logs.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-marker">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="timeline-title">
                        <span className="timeline-action">{log.action}</span>
                        student <span className="timeline-target">{log.targetName}</span>
                      </div>
                      <div className="timeline-date">{formatDateFull(log.createdAt)}</div>
                    </div>
                    {log.details && (
                      <div className="timeline-details">
                        {formatChanges(log.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {renderPagination()}
        </>
      )}
    </PageWrapper>
  );
}

export default ActivityLog;
