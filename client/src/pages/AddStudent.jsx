import PageWrapper from '../components/Layout/PageWrapper';

function AddStudent() {
  return (
    <PageWrapper
      title="Add Student"
      description="Register a new student in the system."
    >
      <div className="placeholder-card glass">
        <div className="placeholder-icon">📝</div>
        <p className="placeholder-title">Student form coming in Phase 4</p>
        <p className="placeholder-text">Full form with validation and photo upload.</p>
      </div>
    </PageWrapper>
  );
}

export default AddStudent;
