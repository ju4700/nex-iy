import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="app-wrapper">
      <Sidebar />
      <main className="app-main">
        <header className="dashboard-header">
          <h1>Welcome back, {user.name}</h1>
          <p className="role">Your Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </header>
        <div className="dashboard-content">
          <section className="dashboard-section" id="chat">
            <h2 className="section-title">Team Chat</h2>
            <Chat roomId="general" />
          </section>
          <section className="dashboard-section" id="tasks">
            <h2 className="section-title">Task Management</h2>
            <TaskBoard />
          </section>
          <section className="dashboard-section" id="checkin">
            <h2 className="section-title">Daily Check-In</h2>
            <DailyCheckIn />
          </section>
          <section className="dashboard-section" id="meeting">
            <h2 className="section-title">Meeting Room</h2>
            <MeetingRoom />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;