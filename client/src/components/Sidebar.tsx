import { motion } from 'framer-motion';
import { useUserStore } from '../store/user';
import { FaComments, FaTasks, FaClipboardCheck, FaVideo, FaSignOutAlt } from 'react-icons/fa';
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
      initial={{ x: -260 }}
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
            whileHover={{ scale: 1.1, backgroundColor: '#2a5d8e' }}
            whileTap={{ scale: 0.95 }}
            title={item.label}
          >
            {item.icon}
          </motion.button>
        ))}
      </nav>
      <motion.button
        className="logout-btn"
        onClick={logout}
        whileHover={{ scale: 1.1, backgroundColor: '#e63946' }}
        whileTap={{ scale: 0.95 }}
        title="Logout"
      >
        <FaSignOutAlt />
      </motion.button>
    </motion.aside>
  );
};

export default Sidebar;