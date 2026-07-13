import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineUserAdd,
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

function StudentList() {
  const navigate = useNavigate();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Available courses (fetched from data)
  const [courses, setCourses] = useState([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStudents({
        page, limit: 12, search, course, year, gender, sortBy, order,
      });
      setStudents(data.data);
      setPagination(data.pagination);

      // Extract unique courses for filter dropdown
      if (courses.length === 0) {
        const statsData = await api.getStudentStats();
        setCourses(statsData.data.byCourse.map((c) => c.course));
      }
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, course, year, gender, sortBy, order]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.deleteStudent(id);
      toast.success(`${name} deleted successfully`);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setDeleting(null);
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'name-asc') { setSortBy('name'); setOrder('asc'); }
    else if (val === 'name-desc') { setSortBy('name'); setOrder('desc'); }
    else if (val === 'newest') { setSortBy('createdAt'); setOrder('desc'); }
    else if (val === 'oldest') { setSortBy('createdAt'); setOrder('asc'); }
    setPage(1);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    const { totalPages, page: currentPage } = pagination;
    if (!totalPages || totalPages <= 1) return null;

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
          onClick={() => setPage((p) => p - 1)}
        >
          ‹
        </button>
        {pages}
        <button
          className="pagination-btn"
          disabled={!pagination.hasNext}
          onClick={() => setPage((p) => p + 1)}
        >
          ›
        </button>
        <span className="pagination-info">
          {pagination.total} student{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  return (
    <PageWrapper
      title="Student List"
      description="View and manage all registered students."
    >
      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, admission no, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="form-select" value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}>
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
            <option value="">All Years</option>
            {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select className="form-select" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select className="form-select" value={sortBy === 'name' ? `name-${order}` : (order === 'desc' ? 'newest' : 'oldest')} onChange={handleSortChange}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
          </select>
        </div>
        <Link to="/students/add" className="btn btn-primary">
          <HiOutlineUserAdd className="btn-icon" /> Add Student
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="students-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--space-2)' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                </div>
              </div>
              <div className="skeleton skeleton-text" style={{ marginBottom: 'var(--space-2)' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)' }}>
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">
              {search || course || year || gender ? 'No matching students' : 'No students yet'}
            </div>
            <div className="empty-state-text">
              {search || course || year || gender
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding your first student to the system.'}
            </div>
            {!(search || course || year || gender) && (
              <Link to="/students/add" className="btn btn-primary">
                <HiOutlineUserAdd /> Add First Student
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Student Cards Grid */}
          <div className="students-grid">
            {students.map((student, i) => (
              <div
                key={student.id}
                className={`student-card glass animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <div className="student-card-header">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="student-card-avatar" />
                  ) : (
                    <div className="student-card-avatar-placeholder">{getInitials(student.name)}</div>
                  )}
                  <div className="student-card-info">
                    <div className="student-card-name">{student.name}</div>
                    <div className="student-card-admission">{student.admissionNo}</div>
                  </div>
                </div>
                <div className="student-card-details">
                  <span className="student-card-detail">
                    <HiOutlineAcademicCap className="student-card-detail-icon" />
                    {student.course}
                  </span>
                  <span className="student-card-detail">
                    <HiOutlineCalendar className="student-card-detail-icon" />
                    Year {student.year}
                  </span>
                  <span className="student-card-detail">
                    <HiOutlineMail className="student-card-detail-icon" />
                    {student.email}
                  </span>
                  <span className="student-card-detail">
                    <HiOutlinePhone className="student-card-detail-icon" />
                    {student.mobile}
                  </span>
                </div>
                <div className="student-card-actions" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/students/${student.id}`}
                    className="btn btn-ghost btn-sm"
                    title="View"
                  >
                    <HiOutlineEye />
                  </Link>
                  <Link
                    to={`/students/${student.id}/edit`}
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                  >
                    <HiOutlinePencil />
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--accent-danger)' }}
                    title="Delete"
                    disabled={deleting === student.id}
                    onClick={() => handleDelete(student.id, student.name)}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </PageWrapper>
  );
}

export default StudentList;
