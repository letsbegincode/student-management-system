import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import './App.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudentList = lazy(() => import('./pages/StudentList'));
const AddStudent = lazy(() => import('./pages/AddStudent'));
const EditStudent = lazy(() => import('./pages/EditStudent'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));

// Fallback loader while downloading chunks
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '50vh' }}>
    <div className="skeleton-avatar" style={{ width: 40, height: 40 }} />
  </div>
);

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<StudentList />} />
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="students/:id/edit" element={<EditStudent />} />
              <Route path="activity-logs" element={<ActivityLog />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
