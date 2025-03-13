import { useUserStore } from '../store/user';
import '../styles/sidebar.css';

const Sidebar = () => {
  const setUser = useUserStore((state) => state.setUser);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>StartupSync</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#chat">Chat</a></li>
          <li><a href="#tasks">Tasks</a></li>
          <li><a href="#checkin">Daily Check-In</a></li>
          <li><a href="#meeting">Meeting Room</a></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;