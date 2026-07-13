import { useState, useRef } from 'react';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';

function PhotoUpload({ currentPhotoUrl, onFileSelect }) {
  const [preview, setPreview] = useState(currentPhotoUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`photo-upload ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {preview ? (
        <div className="photo-upload-preview">
          <img src={preview} alt="Preview" className="photo-upload-image" />
          <button
            type="button"
            className="photo-upload-remove"
            onClick={handleRemove}
            title="Remove photo"
          >
            <HiOutlineX />
          </button>
        </div>
      ) : (
        <div className="photo-upload-placeholder">
          <HiOutlinePhotograph className="photo-upload-icon" />
          <p className="photo-upload-text">
            <span className="photo-upload-cta">Click to upload</span> or drag & drop
          </p>
          <p className="photo-upload-hint">JPEG, PNG, WebP · Max 5MB</p>
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
