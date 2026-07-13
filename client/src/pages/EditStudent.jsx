import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';

function EditStudent() {
  const { id } = useParams();
  return (
    <PageWrapper title="Edit Student" description="Update student information.">
      <div className="placeholder-card glass">
        <div className="placeholder-icon">✏️</div>
        <p className="placeholder-title">Edit form coming in Phase 4</p>
        <p className="placeholder-text">Student ID: {id}</p>
      </div>
    </PageWrapper>
  );
}

export default EditStudent;
