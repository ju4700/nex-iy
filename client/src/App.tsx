import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from './store/user';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import TaskBoard from './components/TaskBoard';
import DailyCheckIn from './components/DailyCheckIn';
import MeetingRoom from './components/MeetingRoom';
import './styles/app.css';

const App = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [activeSection, setActiveSection] = useState('chat');

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="app-wrapper">
      <Sidebar setActiveSection={setActiveSection} />
      <motion.main
        className="app-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="dashboard-header card">
          <h1>Hello, {user.name}</h1>
          <p className="role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </header>
        <AnimatePresence mode="wait">
          {activeSection === 'chat' && (
            <motion.section
              key="chat"
              className="dashboard-section card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Chat roomId="general" />
            </motion.section>
          )}
          {activeSection === 'tasks' && (
            <motion.section
              key="tasks"
              className="dashboard-section card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TaskBoard />
            </motion.section>
          )}
          {activeSection === 'checkin' && (
            <motion.section
              key="checkin"
              className="dashboard-section card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyCheckIn />
            </motion.section>
          )}
          {activeSection === 'meeting' && (
            <motion.section
              key="meeting"
              className="dashboard-section card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MeetingRoom />
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default App;