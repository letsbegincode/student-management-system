import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineUserAdd,
  HiOutlineClipboardList,
  HiOutlinePlusCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from 'react-icons/hi';
import PageWrapper from '../components/Layout/PageWrapper';
import api from '../services/api';

const GENDER_COLORS = {
  Male: '#6366f1',
  Female: '#ec4899',
  Other: '#f59e0b',
};

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const getActionIcon = (action) => {
  switch (action) {
    case 'CREATE': return <div className="action-icon icon-create" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}><HiOutlinePlusCircle size={20} /></div>;
    case 'UPDATE': return <div className="action-icon icon-update" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}><HiOutlinePencilAlt size={20} /></div>;
    case 'DELETE': return <div className="action-icon icon-delete" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}><HiOutlineTrash size={20} /></div>;
    default: return null;
  }
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.getStudentStats(),
          api.getActivityLogs({ limit: 5 })
        ]);
        setStats(statsRes.data);
        setRecentActivity(activityRes.data || []);
      } catch {
        // Stats will show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Dashboard" description="Overview of your student data">
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-avatar" style={{ marginBottom: 'var(--space-4)' }} />
              <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--space-2)' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="skeleton-card" style={{ height: 300 }} />
          <div className="skeleton-card" style={{ height: 300 }} />
        </div>
      </PageWrapper>
    );
  }

  const total = stats?.total || 0;
  const courses = stats?.byCourse?.length || 0;
  const courseData = stats?.byCourse || [];
  const yearData = stats?.byYear || [];
  
  const maxCourseCount = Math.max(...courseData.map((c) => c.count), 1);

  // Year Donut Chart Calculations
  let conicSegments = '';
  let cumulativePercent = 0;
  
  const YEAR_COLORS = {
    1: '#6366f1',
    2: '#ec4899',
    3: '#f59e0b',
    4: '#10b981',
    5: '#8b5cf6',
  };

  if (total > 0 && yearData.length > 0) {
    conicSegments = yearData
      .map((y) => {
        const percent = (y.count / total) * 100;
        const color = YEAR_COLORS[y.year] || '#64748b';
        const segment = `${color} ${cumulativePercent}% ${cumulativePercent + percent}%`;
        cumulativePercent += percent;
        return segment;
      })
      .join(', ');
  }
  if (!conicSegments) conicSegments = 'var(--bg-input) 0% 100%';

  return (
    <PageWrapper title="Dashboard" description="Overview of your student data">
      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card glass animate-fade-in-up stagger-1">
          <div className="stat-card-icon purple"><HiOutlineUserGroup /></div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Total Students</div>
        </div>
        <div className="stat-card glass animate-fade-in-up stagger-2">
          <div className="stat-card-icon green"><HiOutlineAcademicCap /></div>
          <div className="stat-card-value">{courses}</div>
          <div className="stat-card-label">Active Courses</div>
        </div>
        <div className="stat-card glass animate-fade-in-up stagger-3">
          <div className="stat-card-icon orange"><HiOutlineUserAdd /></div>
          <div className="stat-card-value">{recentActivity.length}</div>
          <div className="stat-card-label">Recent Actions</div>
        </div>
        <div className="stat-card glass animate-fade-in-up stagger-4">
          <div className="stat-card-icon blue"><HiOutlineClipboardList /></div>
          <div className="stat-card-value">{yearData.length}</div>
          <div className="stat-card-label">Year Cohorts</div>
        </div>
      </div>

      {total === 0 ? (
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">No students yet</div>
            <div className="empty-state-text">Start by adding your first student to see analytics and charts here.</div>
            <Link to="/students/add" className="btn btn-primary">
              <HiOutlineUserAdd /> Add First Student
            </Link>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Course Distribution */}
          <div className="dashboard-section glass animate-fade-in-up stagger-3">
            <h3 className="dashboard-section-title">📊 Students by Course</h3>
            <div className="bar-chart">
              {courseData.map((c) => (
                <div key={c.course} className="bar-chart-item">
                  <span className="bar-chart-label" title={c.course}>{c.course}</span>
                  <div className="bar-chart-track">
                    <div
                      className="bar-chart-fill"
                      style={{ width: `${(c.count / maxCourseCount) * 100}%` }}
                    />
                  </div>
                  <span className="bar-chart-count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Students by Year Distribution */}
          <div className="dashboard-section glass animate-fade-in-up stagger-4">
            <h3 className="dashboard-section-title">🎓 Students by Year</h3>
            <div className="donut-chart-wrapper">
              <div
                className="donut-chart"
                style={{ background: `conic-gradient(${conicSegments})` }}
              >
                <div className="donut-chart-center">
                  <span className="donut-chart-total">{total}</span>
                  <span className="donut-chart-total-label">Total</span>
                </div>
              </div>
              <div className="donut-legend">
                {yearData.map((y) => (
                  <div key={y.year} className="donut-legend-item">
                    <span
                      className="donut-legend-color"
                      style={{ background: YEAR_COLORS[y.year] || '#64748b' }}
                    />
                    <span>Year {y.year}</span>
                    <span className="donut-legend-value">{y.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="dashboard-section glass animate-fade-in-up stagger-5" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>🕐 Recent System Activity</h3>
              <Link to="/activity" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--font-xs)' }}>View All</Link>
            </div>
            <div className="recent-list">
              {recentActivity.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity.</div>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="recent-item" style={{ cursor: 'default' }}>
                    {getActionIcon(log.action)}
                    <div className="recent-item-info">
                      <div className="recent-item-name">
                        <span style={{ fontWeight: 700, color: 'var(--text-heading)', marginRight: '4px' }}>{log.action}</span>
                        student record
                      </div>
                      <div className="recent-item-detail">Student: {log.studentName}</div>
                    </div>
                    <span className="recent-item-time">{timeAgo(log.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default Dashboard;
