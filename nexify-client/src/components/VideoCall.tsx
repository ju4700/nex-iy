import { FC, useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../utils/auth';
import Peer, { MediaConnection } from 'peerjs';

interface UserJoinedData {
  userId: string;
  peerId: string;
}

interface UserLeftData {
  userId: string;
}

const VideoContainer = styled.div`
  margin: 20px;
  max-width: 800px;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

const VideoWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
`;

const StartButton = styled(Button)`
  background: #28a745;
  color: white;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EndButton = styled(Button)`
  background: #dc3545;
  color: white;
  border: none;
`;

const Instructions = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const Error = styled.div`
  color: #dc3545;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const VideoCall: FC = () => {
  const { user, token, selectedTeam } = useAuth();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, MediaConnection>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remotePeers, setRemotePeers] = useState<Record<string, string>>({});
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideos = useRef<Record<string, HTMLVideoElement>>({});
  
  useEffect(() => {
    if (user && selectedTeam && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedTeam, token]);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('user-joined', ({ userId, peerId }: UserJoinedData) => {
      console.log('User joined:', userId, peerId);
      setRemotePeers(prev => ({ ...prev, [userId]: peerId }));
      
      if (peer && myStream && userId !== user?.id) {
        const call = peer.call(peerId, myStream);
        handleNewCall(call, userId);
      }
    });
    
    socket.on('user-left', ({ userId }: UserLeftData) => {
      console.log('User left:', userId);
      setRemotePeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[userId];
        return newPeers;
      });
      
      if (peers[userId]) {
        peers[userId].close();
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
    });
    
    return () => {
      socket.off('connect');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, peer, myStream, user, peers]);
  
  const handleNewCall = (call: MediaConnection, userId: string) => {
    
    call.on('stream', remoteStream => {
      console.log('Received stream from', userId);
      if (remoteVideos.current[userId]) {
        remoteVideos.current[userId].srcObject = remoteStream;
      }
    });
    
    call.on('close', () => {
      console.log('Call closed with', userId);
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[userId];
        return newPeers;
      });
    });
    
    call.on('error', err => {
      setError(`Call error with ${userId}: ${err.message}`);
    });
    
    setPeers(prev => ({ ...prev, [userId]: call }));
  };
  
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      
      const newPeer = new Peer();
      
      newPeer.on('open', (peerId) => {
        console.log('My peer ID is:', peerId);
        setPeer(newPeer);
        
        if (socket && user && selectedTeam) {
          socket.emit('join-video-call', { 
            userId: user.id, 
            teamId: selectedTeam, 
            peerId,
            token 
          });
        }
      });
      
      newPeer.on('call', (call) => {
        console.log('Incoming call');
        call.answer(stream);
        
        const userId = Object.entries(remotePeers).find(([_, pId]) => pId === call.peer)?.[0];
        if (userId) {
          handleNewCall(call, userId);
        }
      });
      
      newPeer.on('error', (err) => {
        setError(`PeerJS error: ${err.message}`);
      });
      
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? (err as Error).message : 'Unknown error';
      setError(`Failed to access media devices: ${errorMessage}`);
    }
  };
  
  const endVideoCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }
    
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    Object.values(peers).forEach(call => call.close());
    setPeers({});
  };
  
  if (!selectedTeam) return <div>Select a team to start a video call</div>;
  
  return (
    <VideoContainer>
      <h2>Video Call</h2>
      {error && <Error>{error}</Error>}
      <Instructions>
        <p>Open two tabs with this page to test the video call functionality.</p>
        <p>Click "Start Call" in both tabs to establish a connection.</p>
      </Instructions>
      <Controls>
        {!myStream ? (
          <StartButton onClick={startVideoCall} disabled={!selectedTeam}>
            Start Call
          </StartButton>
        ) : (
          <EndButton onClick={endVideoCall}>End Call</EndButton>
        )}
      </Controls>
      <VideoGrid>
        {myStream && (
          <VideoWrapper>
            <Video ref={myVideo} autoPlay muted playsInline />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
              You
            </div>
          </VideoWrapper>
        )}
        {Object.keys(peers).map((userId) => (
          <VideoWrapper key={userId}>
            <Video 
              ref={(el) => { if (el) remoteVideos.current[userId] = el; }} 
              autoPlay 
              playsInline 
            />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
              Remote User
            </div>
          </VideoWrapper>
        ))}
      </VideoGrid>
    </VideoContainer>
  );
};

export default VideoCall;