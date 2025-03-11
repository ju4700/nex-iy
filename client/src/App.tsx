import { FC, useState } from 'react';
import Chat from '@components/Chat';
import Board from '@components/Board';
import Tasks from '@components/Tasks';
import VideoCall from '@components/VideoCall';
import ErrorBoundary from '@components/ErrorBoundary';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'board' | 'tasks' | 'call'>('chat');

  const styles = {
    container: { 
      fontFamily: 'Arial', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px' 
    },
    header: {
      textAlign: 'center' as const, 
      color: '#333', 
      marginBottom: '20px'
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px'
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      background: '#f0f0f0',
      border: '1px solid #ddd'
    },
    activeTab: {
      background: '#007bff',
      color: 'white',
      border: '1px solid #0062cc'
    },
    content: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '20px'
    }
  };

  return (
    <ErrorBoundary>
      <div style={styles.container}>
        <h1 style={styles.header}>Nexiy Collaboration Platform</h1>
        
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('chat')} 
            style={{
              ...styles.tab,
              ...(activeTab === 'chat' ? styles.activeTab : {})
            }}
          >
            Team Chat
          </button>
          <button 
            onClick={() => setActiveTab('board')} 
            style={{
              ...styles.tab,
              ...(activeTab === 'board' ? styles.activeTab : {})
            }}
          >
            Planning Board
          </button>
          <button 
            onClick={() => setActiveTab('tasks')} 
            style={{
              ...styles.tab,
              ...(activeTab === 'tasks' ? styles.activeTab : {})
            }}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveTab('call')} 
            style={{
              ...styles.tab,
              ...(activeTab === 'call' ? styles.activeTab : {})
            }}
          >
            Video Call
          </button>
        </div>
        
        <div style={styles.content}>
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'board' && <Board />}
          {activeTab === 'tasks' && <Tasks />}
          {activeTab === 'call' && <VideoCall />}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;