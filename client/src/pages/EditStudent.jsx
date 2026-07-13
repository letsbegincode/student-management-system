import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import StudentForm from '../components/StudentForm/StudentForm';

function EditStudent() {
  const { id } = useParams();
  
  return (
    <PageWrapper
      title="Edit Student"
      description="Update student information."
    >
      <StudentForm studentId={id} />
    </PageWrapper>
  );
}

export default EditStudent;
