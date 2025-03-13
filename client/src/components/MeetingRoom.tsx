import { useState, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../styles/meeting.css';

const MeetingRoom = () => {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
      <h2>Meeting Room</h2>
      <div className="meeting-tools">
        <div className="timer">
          <span>
            Timer: {Math.floor(timer / 3600)}:{Math.floor((timer % 3600) / 60).toString().padStart(2, '0')}:
            {(timer % 60).toString().padStart(2, '0')}
          </span>
          <button onClick={toggleTimer}>{isRunning ? 'Pause' : 'Start'}</button>
          <button onClick={() => setTimer(0)}>Reset</button>
        </div>
      </div>
      <div className="meeting-notes">
        <h3>Collaborative Notes</h3>
        <div id="editor" style={{ height: '300px' }}></div>
      </div>
    </div>
  );
};

export default MeetingRoom;