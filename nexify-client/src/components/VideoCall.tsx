import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@emotion/styled';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@utils/auth';
import SimplePeer, { Instance } from 'simple-peer';

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
  const [peers, setPeers] = useState<Record<string, Instance>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideos = useRef<Record<string, HTMLVideoElement>>({});
  const peersRef = useRef<Record<string, Instance>>({});

  const createPeer = useCallback((userId: string, callerId: string, stream: MediaStream): Instance => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      if (socket) {
        socket.emit('signal', { signal, to: userId, teamId: selectedTeam });
      }
    });

    peer.on('stream', (remoteStream) => {
      if (remoteVideos.current[userId]) {
        remoteVideos.current[userId].srcObject = remoteStream;
      }
    });

    peer.on('error', (err) => {
      setError(`Peer connection error: ${err.message}`);
    });

    return peer;
  }, [socket, selectedTeam]);

  useEffect(() => {
    if (user && selectedTeam) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join-video-call', { userId: user.id, teamId: selectedTeam, token });
      });

      newSocket.on('user-joined', ({ userId }) => {
        if (myStream && userId !== user.id) {
          const peer = createPeer(userId, user.id, myStream);
          setPeers((prev) => ({ ...prev, [userId]: peer }));
          peersRef.current[userId] = peer;
        }
      });

      newSocket.on('user-left', ({ userId }) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].destroy();
          delete peersRef.current[userId];
          setPeers((prev) => {
            const newPeers = { ...prev };
            delete newPeers[userId];
            return newPeers;
          });
        }
      });

      newSocket.on('signal', ({ signal, from }) => {
        if (!peersRef.current[from]) {
          const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: myStream,
          });
          peer.on('signal', (data) => {
            newSocket.emit('signal', { signal: data, to: from, teamId: selectedTeam });
          });
          peer.on('stream', (remoteStream) => {
            if (remoteVideos.current[from]) {
              remoteVideos.current[from].srcObject = remoteStream;
            }
          });
          peer.signal(signal);
          setPeers((prev) => ({ ...prev, [from]: peer }));
          peersRef.current[from] = peer;
        } else {
          peersRef.current[from].signal(signal);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedTeam, token, myStream, createPeer]);

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      setError(null);
    } catch (err: any) {
      setError(`Failed to access media devices: ${err.message}`);
    }
  };

  const endVideoCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }
    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};
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
        {Object.keys(peers).map((peerId) => (
          <VideoWrapper key={peerId}>
            <Video ref={(el) => { if (el) remoteVideos.current[peerId] = el; }} autoPlay playsInline />
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