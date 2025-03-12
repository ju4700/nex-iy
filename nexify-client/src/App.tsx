import { FC, useState } from 'react';
import styled from '@emotion/styled';
import Chat from './components/Chat';
import Board from './components/Board';
import Tasks from './components/Tasks';
import VideoCall from './components/VideoCall';
import Files from './components/Files';
import Login from './components/Login';
import Register from './components/Register';
import Teams from './components/Teams';
import { useAuth } from './utils/auth';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => (props.active ? '#007bff' : '#f0f0f0')};
  color: ${props => (props.active ? 'white' : '#333')};
  border: 1px solid ${props => (props.active ? '#0062cc' : '#ddd')};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => (props.active ? '#0056b3' : '#e0e0e0')};
  }
`;

const Content = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  background: white;
`;

const App: FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'teams' | 'chat' | 'board' | 'tasks' | 'call' | 'files'>(
    user ? 'teams' : 'login'
  );

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <Header>Nexify - Startup Management Platform</Header>
      {user ? (
        <>
          <Tabs>
            <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>
              Teams
            </TabButton>
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
              Team Chat
            </TabButton>
            <TabButton active={activeTab === 'board'} onClick={() => setActiveTab('board')}>
              Planning Board
            </TabButton>
            <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
              Tasks
            </TabButton>
            <TabButton active={activeTab === 'call'} onClick={() => setActiveTab('call')}>
              Video Call
            </TabButton>
            <TabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')}>
              Files
            </TabButton>
          </Tabs>
          <Content>
            {activeTab === 'teams' && <Teams />}
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'board' && <Board />}
            {activeTab === 'tasks' && <Tasks />}
            {activeTab === 'call' && <VideoCall />}
            {activeTab === 'files' && <Files />}
          </Content>
        </>
      ) : (
        <>
          <Tabs>
            <TabButton active={activeTab === 'login'} onClick={() => setActiveTab('login')}>
              Login
            </TabButton>
            <TabButton active={activeTab === 'register'} onClick={() => setActiveTab('register')}>
              Register
            </TabButton>
          </Tabs>
          <Content>
            {activeTab === 'login' && <Login />}
            {activeTab === 'register' && <Register />}
          </Content>
        </>
      )}
    </Container>
  );
};

export default App;