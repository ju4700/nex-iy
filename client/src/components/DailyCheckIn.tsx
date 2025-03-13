import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/checkin.css';

const DailyCheckIn = () => {
  const [goals, setGoals] = useState('');
  const [roadblocks, setRoadblocks] = useState('');
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reports', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => setReports(res.data));
  }, []);

  const submitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/reports', { goals, roadblocks }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReports((prev) => [data, ...prev]);
      setGoals('');
      setRoadblocks('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="checkin-container">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Daily Check-In
      </motion.h2>
      <motion.form
        onSubmit={submitCheckIn}
        className="checkin-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="goals">Today’s Goals</label>
          <textarea
            className="form-textarea"
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What’s on your agenda today?"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="roadblocks">Roadblocks</label>
          <textarea
            className="form-textarea"
            id="roadblocks"
            value={roadblocks}
            onChange={(e) => setRoadblocks(e.target.value)}
            placeholder="Any obstacles in your way?"
          />
        </div>
        <button className="btn btn-primary" type="submit">Submit</button>
      </motion.form>
      <motion.div
        className="checkin-history"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3>Recent Check-Ins</h3>
        {reports.slice(0, 5).map((report, idx) => (
          <motion.div
            key={report._id}
            className="checkin-entry card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <p><strong>{report.userId.name}</strong> - {new Date(report.date).toLocaleDateString()}</p>
            <p><strong>Goals:</strong> {report.goals}</p>
            {report.roadblocks && <p><strong>Roadblocks:</strong> {report.roadblocks}</p>}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DailyCheckIn;