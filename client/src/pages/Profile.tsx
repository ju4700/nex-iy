import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/user';
import axios from 'axios';
import '../styles/profile.css';

const Profile = () => {
  const { user, setUser } = useUserStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [team, setTeam] = useState(user?.team || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user?.id}`,
        { name, email, role, team },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(data);
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed.');
      setSuccess('');
    }
  };

  return (
    <div className="profile-container">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Profile
      </motion.h2>
      <motion.form
        onSubmit={handleUpdate}
        className="profile-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
          <input
            className="form-input"
            type="text"
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Engineering"
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <motion.button
          className="btn btn-primary"
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Update Profile
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Profile;