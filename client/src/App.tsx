import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useUserStore } from './store/user';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import TaskBoard from './components/TaskBoard';
import DailyCheckIn from './components/DailyCheckIn';
import MeetingRoom from './components/MeetingRoom';
import Profile from './pages/Profile';
import './styles/app.css';

const App = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const [activeSection, setActiveSection] = useState('chat');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user && !token) {
      navigate('/login');
    } else if (!user && token) {
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(({ data }) => {
          useUserStore.getState().setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            team: data.team,
            workspaces: data.workspaces,
          });
        })
        .catch(() => navigate('/login'));
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="loading-wrapper">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Sidebar setActiveSection={setActiveSection} />
      <motion.main
        className="app-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
              <Chat />
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
          {activeSection === 'profile' && (
            <motion.section
              key="profile"
              className="dashboard-section card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Profile />
            </motion.section>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default App;