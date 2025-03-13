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
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <section id="dashboard" className="section">
          <h1>Welcome, {user.name}</h1>
          <p>Your role: {user.role}</p>
        </section>
        <section id="chat" className="section">
          <Chat roomId="general" />
        </section>
        <section id="tasks" className="section">
          <TaskBoard />
        </section>
        <section id="checkin" className="section">
          <DailyCheckIn />
        </section>
        <section id="meeting" className="section">
          <MeetingRoom />
        </section>
      </main>
    </div>
  );
};

export default App;