import { useState, useEffect } from 'react';
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
      <h2>Daily Check-In</h2>
      <form onSubmit={submitCheckIn} className="checkin-form">
        <div className="form-group">
          <label htmlFor="goals">Today’s Goals</label>
          <textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you plan to achieve today?"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="roadblocks">Roadblocks</label>
          <textarea
            id="roadblocks"
            value={roadblocks}
            onChange={(e) => setRoadblocks(e.target.value)}
            placeholder="Any challenges or obstacles?"
          />
        </div>
        <button type="submit">Submit Check-In</button>
      </form>
      <div className="checkin-history">
        <h3>Recent Check-Ins</h3>
        {reports.slice(0, 5).map((report) => (
          <div key={report._id} className="checkin-entry">
            <p><strong>{report.userId.name}</strong> - {new Date(report.date).toLocaleDateString()}</p>
            <p><strong>Goals:</strong> {report.goals}</p>
            {report.roadblocks && <p><strong>Roadblocks:</strong> {report.roadblocks}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyCheckIn;