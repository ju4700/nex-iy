import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useUserStore } from '../store/user';
import '../styles/register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        name,
        role,
        workspaceName,
      });
      localStorage.setItem('token', data.token);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email, 
        role: data.user.role,
        team: data.user.team,
        workspaces: data.user.workspaces.map((w: any) => ({ id: w._id || w, name: w.name })),
      });
      navigate('/app');
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
          <p>Create your workspace</p>
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
            <label className="form-label" htmlFor="workspaceName">Workspace Name</label>
            <input
              className="form-input"
              type="text"
              id="workspaceName"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Workspace"
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <motion.button
            className="btn btn-primary"
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Workspace
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