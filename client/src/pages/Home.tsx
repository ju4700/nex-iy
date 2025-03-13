import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          NEXIF
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="tagline"
        >
          Collaborate, Innovate, Accelerate
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="cta-buttons"
        >
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Get Started
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Log In
          </button>
        </motion.div>
      </header>
      <section className="features">
        <motion.div
          className="feature-card card"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h3>Real-Time Collaboration</h3>
          <p>Chat, share tasks, and meet with your team seamlessly in one platform.</p>
        </motion.div>
        <motion.div
          className="feature-card card"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h3>Task Mastery</h3>
          <p>Organize projects with intuitive drag-and-drop boards and priority filters.</p>
        </motion.div>
        <motion.div
          className="feature-card card"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <h3>Meeting Efficiency</h3>
          <p>Plan agendas, take notes, and track time—all in your virtual meeting room.</p>
        </motion.div>
      </section>
      <footer className="home-footer">
        <p>© 2025 NEXIF. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;