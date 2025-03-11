import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Chat from '@components/Chat';
import Board from '@components/Board';
import Tasks from '@components/Tasks';
import VideoCall from '@components/VideoCall';

const styles = {
  app: { fontFamily: 'Arial, sans-serif', padding: '20px' },
  section: { marginBottom: '40px' },
} as const;

const App = () => (
  <div style={styles.app}>
    <div style={styles.section}>
      <Chat />
    </div>
    <div style={styles.section}>
      <Board />
    </div>
    <div style={styles.section}>
      <Tasks />
    </div>
    <div style={styles.section}>
      <VideoCall />
    </div>
  </div>
);

const rootElement = document.getElementById('root')!;
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);