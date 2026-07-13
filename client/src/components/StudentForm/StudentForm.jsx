import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from '../PhotoUpload/PhotoUpload';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const INITIAL_STATE = {
  name: '',
  email: '',
  mobile: '',
  gender: '',
  dob: '',
  course: '',
  year: '',
  address: '',
};

function StudentForm({ studentId = null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(studentId);

  const [form, setForm] = useState(INITIAL_STATE);
  const [photo, setPhoto] = useState(null); // File object
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Fetch existing student data for edit mode
  useEffect(() => {
    if (!isEdit) return;
    const fetchStudent = async () => {
      try {
        const data = await api.getStudent(studentId);
        const s = data.data;
        setForm({
          name: s.name || '',
          email: s.email || '',
          mobile: s.mobile || '',
          gender: s.gender || '',
          dob: s.dob ? s.dob.split('T')[0] : '',
          course: s.course || '',
          year: s.year?.toString() || '',
          address: s.address || '',
        });
        setCurrentPhotoUrl(s.photoUrl || null);
      } catch {
        toast.error('Failed to load student data');
        navigate('/students');
      } finally {
        setFetching(false);
      }
    };
    fetchStudent();
  }, [studentId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.gender) errs.gender = 'Select a gender';
    if (!form.dob) errs.dob = 'Select date of birth';
    else {
      const age = (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 15) errs.dob = 'Student must be at least 15 years old';
    }
    if (!form.course || form.course.trim().length < 2) errs.course = 'Enter a valid course name';
    if (!form.year) errs.year = 'Select a year';
    if (!form.address || form.address.trim().length < 5) errs.address = 'Address must be at least 5 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only validate non-empty fields in edit mode
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null) formData.append(key, val);
      });
      if (photo) formData.append('photo', photo);

      if (isEdit) {
        await api.updateStudent(studentId, formData);
        toast.success('Student updated successfully');
      } else {
        await api.createStudent(formData);
        toast.success('Student created successfully');
      }
      navigate('/students');
    } catch (err) {
      if (err.errors?.length > 0) {
        const fieldErrors = {};
        err.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="student-form glass">
        <div className="form-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="form-group">
              <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 44 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form className="student-form glass" onSubmit={handleSubmit} noValidate>
      {/* Photo Upload */}
      <div className="form-photo-section">
        <PhotoUpload
          currentPhotoUrl={currentPhotoUrl}
          onFileSelect={setPhoto}
        />
      </div>

      {/* Form Fields */}
      <div className="form-grid">
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Full Name <span className="required">*</span></label>
          <input
            type="text"
            name="name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. Abhinav Sharma"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email <span className="required">*</span></label>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="e.g. abhinav@example.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label className="form-label">Mobile Number <span className="required">*</span></label>
          <input
            type="tel"
            name="mobile"
            className={`form-input ${errors.mobile ? 'error' : ''}`}
            placeholder="e.g. 9876543210"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
          />
          {errors.mobile && <span className="form-error">{errors.mobile}</span>}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label">Gender <span className="required">*</span></label>
          <select
            name="gender"
            className={`form-select ${errors.gender ? 'error' : ''}`}
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="form-error">{errors.gender}</span>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label className="form-label">Date of Birth <span className="required">*</span></label>
          <input
            type="date"
            name="dob"
            className={`form-input ${errors.dob ? 'error' : ''}`}
            value={form.dob}
            onChange={handleChange}
          />
          {errors.dob && <span className="form-error">{errors.dob}</span>}
        </div>

        {/* Course */}
        <div className="form-group">
          <label className="form-label">Course <span className="required">*</span></label>
          <input
            type="text"
            name="course"
            className={`form-input ${errors.course ? 'error' : ''}`}
            placeholder="e.g. B.Tech Computer Science"
            value={form.course}
            onChange={handleChange}
          />
          {errors.course && <span className="form-error">{errors.course}</span>}
        </div>

        {/* Year */}
        <div className="form-group">
          <label className="form-label">Year <span className="required">*</span></label>
          <select
            name="year"
            className={`form-select ${errors.year ? 'error' : ''}`}
            value={form.year}
            onChange={handleChange}
          >
            <option value="">Select year</option>
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
          {errors.year && <span className="form-error">{errors.year}</span>}
        </div>

        {/* Address — full width */}
        <div className="form-group form-full-width">
          <label className="form-label">Address <span className="required">*</span></label>
          <textarea
            name="address"
            className={`form-textarea ${errors.address ? 'error' : ''}`}
            placeholder="Enter full address"
            rows={3}
            value={form.address}
            onChange={handleChange}
          />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Student' : 'Add Student'
          )}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
