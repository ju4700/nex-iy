import { FC } from 'react';
import Chat from '@components/Chat';
import ErrorBoundary from '@components/ErrorBoundary';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <div style={{ fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Nexiy MVP</h1>
        <Chat />
      </div>
    </ErrorBoundary>
  );
};

export default App;