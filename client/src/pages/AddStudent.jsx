import PageWrapper from '../components/Layout/PageWrapper';
import StudentForm from '../components/StudentForm/StudentForm';

function AddStudent() {
  return (
    <PageWrapper
      title="Add Student"
      description="Register a new student in the system."
    >
      <StudentForm />
    </PageWrapper>
  );
}

export default AddStudent;
