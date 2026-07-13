import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';

function StudentDetail() {
  const { id } = useParams();
  return (
    <PageWrapper title="Student Details" description="View complete student profile.">
      <div className="placeholder-card glass">
        <div className="placeholder-icon">👤</div>
        <p className="placeholder-title">Student profile coming in Phase 4</p>
        <p className="placeholder-text">Student ID: {id}</p>
      </div>
    </PageWrapper>
  );
}

export default StudentDetail;
