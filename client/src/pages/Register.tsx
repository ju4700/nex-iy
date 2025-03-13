import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [team, setTeam] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const teams = ['Design', 'Engineering', 'Product', 'Marketing', 'Operations'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { email, password, name, role, team });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-container card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>NEXIF</h1>
          <p>Join the workspace</p>
        </div>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              className="form-input"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              className="form-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="founder">Founder</option>
              <option value="team_lead">Team Lead</option>
              <option value="intern">Intern</option>
              <option value="member">Member</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="team">Team</label>
            <select
              className="form-select"
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
            >
              <option value="">Select a team</option>
              {teams.map((t) => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>
          {error && <p className="error-text">{error}</p>}
          <motion.button
            className="btn btn-primary"
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </form>
        <p className="auth-footer">
          Have an account? <a href="/login">Log In</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;