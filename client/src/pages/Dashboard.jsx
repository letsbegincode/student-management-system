import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineUserAdd,
  HiOutlineClipboardList,
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

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStudentStats();
        setStats(data.data);
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
  const genderData = stats?.byGender || [];
  const courseData = stats?.byCourse || [];
  const recentStudents = stats?.recentStudents || [];
  const maxCourseCount = Math.max(...courseData.map((c) => c.count), 1);

  // Build conic-gradient for donut chart
  let conicSegments = '';
  let accumulated = 0;
  genderData.forEach((g, i) => {
    const pct = total > 0 ? (g.count / total) * 100 : 0;
    const color = GENDER_COLORS[g.gender] || '#64748b';
    conicSegments += `${color} ${accumulated}% ${accumulated + pct}%`;
    accumulated += pct;
    if (i < genderData.length - 1) conicSegments += ', ';
  });
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
          <div className="stat-card-value">{recentStudents.length}</div>
          <div className="stat-card-label">Recent Additions</div>
        </div>
        <div className="stat-card glass animate-fade-in-up stagger-4">
          <div className="stat-card-icon blue"><HiOutlineClipboardList /></div>
          <div className="stat-card-value">{genderData.length}</div>
          <div className="stat-card-label">Gender Categories</div>
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

          {/* Gender Distribution */}
          <div className="dashboard-section glass animate-fade-in-up stagger-4">
            <h3 className="dashboard-section-title">👥 Gender Distribution</h3>
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
                {genderData.map((g) => (
                  <div key={g.gender} className="donut-legend-item">
                    <span
                      className="donut-legend-color"
                      style={{ background: GENDER_COLORS[g.gender] || '#64748b' }}
                    />
                    <span>{g.gender}</span>
                    <span className="donut-legend-value">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Students */}
          <div className="dashboard-section glass animate-fade-in-up stagger-5" style={{ gridColumn: '1 / -1' }}>
            <h3 className="dashboard-section-title">🕐 Recently Added</h3>
            <div className="recent-list">
              {recentStudents.map((s) => (
                <Link to={`/students/${s.id}`} key={s.id} className="recent-item">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="recent-item-avatar" />
                  ) : (
                    <div className="recent-item-avatar-placeholder">{getInitials(s.name)}</div>
                  )}
                  <div className="recent-item-info">
                    <div className="recent-item-name">{s.name}</div>
                    <div className="recent-item-detail">{s.admissionNo} · {s.course}</div>
                  </div>
                  <span className="recent-item-time">{timeAgo(s.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

export default Dashboard;
