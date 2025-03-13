import { motion } from 'framer-motion';
import { useUserStore } from '../store/user';
import { FaComments, FaTasks, FaClipboardCheck, FaVideo, FaSignOutAlt, FaUser } from 'react-icons/fa';
import '../styles/sidebar.css';

interface SidebarProps {
  setActiveSection: (section: string) => void;
}

const Sidebar = ({ setActiveSection }: SidebarProps) => {
  const setUser = useUserStore((state) => state.setUser);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const navItems = [
    { id: 'chat', icon: <FaComments />, label: 'Chat' },
    { id: 'tasks', icon: <FaTasks />, label: 'Tasks' },
    { id: 'checkin', icon: <FaClipboardCheck />, label: 'Check-In' },
    { id: 'meeting', icon: <FaVideo />, label: 'Meeting' },
  ];

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="sidebar-header">
        <h2>NEXIF</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            className="nav-item"
            onClick={() => setActiveSection(item.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={item.label}
          >
            {item.icon}
          </motion.button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <motion.button
          className="nav-item"
          onClick={() => setActiveSection('profile')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Profile"
        >
          <FaUser />
        </motion.button>
        <motion.button
          className="nav-item logout-btn"
          onClick={logout}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Logout"
        >
          <FaSignOutAlt />
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;