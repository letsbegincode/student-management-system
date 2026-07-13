import { useLocation } from 'react-router-dom';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your student data' },
  '/students': { title: 'Students', subtitle: 'Manage all student records' },
  '/students/add': { title: 'Add Student', subtitle: 'Register a new student' },
  '/activity-logs': { title: 'Activity Log', subtitle: 'Track all system actions' },
};

function Header({ onMenuClick }) {
  const location = useLocation();

  let pageInfo = pageTitles[location.pathname];
  if (!pageInfo) {
    if (location.pathname.includes('/edit')) {
      pageInfo = { title: 'Edit Student', subtitle: 'Update student information' };
    } else if (location.pathname.startsWith('/students/')) {
      pageInfo = { title: 'Student Details', subtitle: 'View student profile' };
    } else {
      pageInfo = { title: 'Page', subtitle: '' };
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <HiOutlineMenuAlt2 />
        </button>
        <div>
          <h1 className="header-title">{pageInfo.title}</h1>
          <p className="header-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>
      <div className="header-right">
        {/* Future: search bar, notifications */}
      </div>
    </header>
  );
}

export default Header;
