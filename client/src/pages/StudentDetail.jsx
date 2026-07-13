import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineClock
} from 'react-icons/hi';
import PageWrapper from '../components/Layout/PageWrapper';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await api.getStudent(id);
        setStudent(data.data);
      } catch (err) {
        toast.error('Student not found');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteStudent(id);
      toast.success('Student deleted successfully');
      navigate('/students');
    } catch {
      toast.error('Failed to delete student');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Student Profile">
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <div className="skeleton skeleton-avatar" style={{ width: 120, height: 120, borderRadius: 'var(--radius-2xl)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--space-3)' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 'var(--space-2)' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!student) return null;

  return (
    <PageWrapper
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ padding: 0 }}>
            <HiOutlineArrowLeft style={{ fontSize: '1.5rem' }} />
          </button>
          Student Profile
        </div>
      }
      description="Detailed view of student information."
    >
      <div className="profile-layout">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="profile-sidebar glass">
          <div className="profile-avatar-container">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {getInitials(student.name)}
              </div>
            )}
          </div>
          
          <h2 className="profile-name">{student.name}</h2>
          <div className="badge badge-primary profile-admission">
            <HiOutlineIdentification />
            {student.admissionNo}
          </div>
          
          <div className="profile-actions">
            <Link to={`/students/${id}/edit`} className="btn btn-primary" style={{ width: '100%' }}>
              <HiOutlinePencil /> Edit Profile
            </Link>
            <button 
              className="btn btn-danger" 
              style={{ width: '100%' }}
              onClick={handleDelete}
              disabled={deleting}
            >
              <HiOutlineTrash /> {deleting ? 'Deleting...' : 'Delete Student'}
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="profile-content">
          <div className="glass profile-section">
            <h3 className="profile-section-title">Academic Information</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label"><HiOutlineAcademicCap /> Course</div>
                <div className="profile-info-value">{student.course}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label"><HiOutlineCalendar /> Year</div>
                <div className="profile-info-value">Year {student.year}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label"><HiOutlineClock /> Admitted On</div>
                <div className="profile-info-value">{formatDate(student.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="glass profile-section">
            <h3 className="profile-section-title">Personal Information</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Gender</div>
                <div className="profile-info-value">{student.gender}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Date of Birth</div>
                <div className="profile-info-value">{formatDate(student.dob)}</div>
              </div>
            </div>
          </div>

          <div className="glass profile-section">
            <h3 className="profile-section-title">Contact Information</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label"><HiOutlineMail /> Email Address</div>
                <div className="profile-info-value">{student.email}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label"><HiOutlinePhone /> Mobile Number</div>
                <div className="profile-info-value">+91 {student.mobile}</div>
              </div>
              <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                <div className="profile-info-label"><HiOutlineLocationMarker /> Permanent Address</div>
                <div className="profile-info-value" style={{ whiteSpace: 'pre-wrap' }}>{student.address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default StudentDetail;
