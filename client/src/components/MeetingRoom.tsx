import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../styles/meeting.css';

const MeetingRoom = () => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [agenda, setAgenda] = useState('');

  useEffect(() => {
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: { toolbar: true },
    });
    return () => { quill.disable(); };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning((prev) => !prev);

  return (
    <div className="meeting-container">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Meeting Room
      </motion.h2>
      <motion.div
        className="meeting-tools"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="timer">
          <span>
            {Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:
            {(timer % 60).toString().padStart(2, '0')}
          </span>
          <button className="btn btn-primary" onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
          <button className="btn btn-secondary" onClick={() => setTimer(0)}>Reset</button>
        </div>
      </motion.div>
      <motion.div
        className="meeting-agenda"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3>Agenda</h3>
        <textarea
          className="form-textarea"
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="Enter today’s agenda..."
        />
      </motion.div>
      <motion.div
        className="meeting-notes"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3>Notes</h3>
        <div id="editor" className="editor"></div>
      </motion.div>
    </div>
  );
};

export default MeetingRoom;