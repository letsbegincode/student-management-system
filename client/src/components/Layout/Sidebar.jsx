import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const navItems = [
  {
    section: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', icon: HiOutlineHome },
    ],
  },
  {
    section: 'Students',
    links: [
      { to: '/students', label: 'Student List', icon: HiOutlineUserGroup },
      { to: '/students/add', label: 'Add Student', icon: HiOutlineUserPlus },
    ],
  },
  {
    section: 'System',
    links: [
      { to: '/activity-log', label: 'Activity Log', icon: HiOutlineClipboardList },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <div>
            <div className="sidebar-logo-text">StudentHub</div>
          </div>
          <span className="sidebar-logo-badge">v1.0</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-title">{section.section}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">
                    <link.icon />
                  </span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            © {new Date().getFullYear()} StudentHub
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
