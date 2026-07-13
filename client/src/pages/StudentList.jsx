import PageWrapper from '../components/Layout/PageWrapper';

function StudentList() {
  return (
    <PageWrapper
      title="Student List"
      description="View and manage all registered students."
    >
      <div className="placeholder-card glass">
        <div className="placeholder-icon">📋</div>
        <p className="placeholder-title">Student list coming in Phase 3</p>
        <p className="placeholder-text">Search, filter, and paginate through student records.</p>
      </div>
    </PageWrapper>
  );
}

export default StudentList;
