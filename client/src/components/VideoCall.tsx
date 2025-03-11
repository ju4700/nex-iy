import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';

interface PeerSignal {
  type: string;
  sdp?: string;
}

const socket: Socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
});

const VideoCall = (): JSX.Element => {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remotePeerIds, setRemotePeerIds] = useState<string[]>([]);
  const [peers, setPeers] = useState<Record<string, SimplePeer>>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideos = useRef<Record<string, HTMLVideoElement>>({});
  const peersRef = useRef<Record<string, SimplePeer>>({});
  
  // Create peer as a useCallback to avoid recreation on each render
  const createPeer = useCallback((target: string, caller: string, stream: MediaStream | null): SimplePeer => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream || undefined,
    });
    
    peer.on('signal', (signal: PeerSignal) => {
      socket.emit('signal', { target, from: caller, signal });
    });
    
    peer.on('stream', (remoteStream: MediaStream) => {
      if (remoteVideos.current[target]) {
        remoteVideos.current[target].srcObject = remoteStream;
      }
    });
    
    // Add error handler
    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setError(`Peer connection error: ${err.message}`);
    });
    
    return peer;
  }, []);
  
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });
    
    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });
    
    socket.on('user-joined', (userId: string) => {
      // Only create peer if we have a stream
      if (myStream && socket.id) {
        const peer = createPeer(userId, socket.id, myStream);
        
        // Store in both state and ref
        setPeers(prevPeers => ({
          ...prevPeers,
          [userId]: peer
        }));
        peersRef.current[userId] = peer;
        setRemotePeerIds(prev => [...prev, userId]);
      }
    });
    
    socket.on('user-left', (userId: string) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        
        // Update state
        setPeers(prevPeers => {
          const updatedPeers = { ...prevPeers };
          delete updatedPeers[userId];
          return updatedPeers;
        });
        
        // Update ref
        delete peersRef.current[userId];
        setRemotePeerIds(prev => prev.filter(id => id !== userId));
      }
    });
    
    socket.on('signal', ({ from, signal }: { from: string, signal: PeerSignal }) => {
      // Use ref for current state of peers
      if (peersRef.current[from]) {
        try {
          peersRef.current[from].signal(signal);
        } catch (err) {
          console.error('Error signaling peer:', err);
        }
      }
    });
    
    socket.on('user-already-connected', (userIds: string[]) => {
      // Only create peers if we have a stream
      if (myStream && socket.id) {
        userIds.forEach(userId => {
          const peer = createPeer(userId, socket.id!, myStream);
          
          // Store in both state and ref
          setPeers(prevPeers => ({
            ...prevPeers,
            [userId]: peer
          }));
          peersRef.current[userId] = peer;
          setRemotePeerIds(prev => [...prev, userId]);
        });
      }
    });
    
    return () => {
      // Clean up all listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('signal');
      socket.off('user-already-connected');
      
      // Clean up video streams
      if (myStream) {
        myStream.getTracks().forEach(track => {
          try { track.stop(); } catch (e) { console.error(e); }
        });
      }
      
      // Clean up peer connections using ref to avoid stale state
      Object.values(peersRef.current).forEach(peer => {
        try { peer.destroy(); } catch (e) { console.error(e); }
      });
    };
  }, [myStream, createPeer]); // Remove peers from dependency array, use peersRef instead
  
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      
      socket.emit('join-video-call');
    } catch (err) {
      console.error('Failed to access media devices:', err);
      setError('Failed to access camera or microphone. Please make sure your devices are connected and permissions are granted.');
    }
  };
  
  const endVideoCall = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { console.error(e); }
      });
      setMyStream(null);
    }
    
    // Use ref to avoid stale state
    Object.values(peersRef.current).forEach(peer => {
      try { peer.destroy(); } catch (e) { console.error(e); }
    });
    peersRef.current = {};
    setPeers({});
    setRemotePeerIds([]);
    socket.emit('leave-video-call');
  };
  
  const styles = {
    container: { margin: '20px', maxWidth: '800px' },
    header: { color: '#333', marginBottom: '10px' },
    videoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '10px',
      marginBottom: '20px',
    },
    videoContainer: {
      position: 'relative' as const,
      paddingBottom: '56.25%', // 16:9 aspect ratio
      height: '0',
      overflow: 'hidden',
      borderRadius: '8px',
      backgroundColor: '#000',
    },
    video: {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    controls: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    startButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
    },
    endButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
    },
    instructions: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    error: {
      color: '#dc3545',
      padding: '10px',
      backgroundColor: '#f8d7da',
      borderRadius: '4px',
      marginBottom: '10px',
    },
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Video Call</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.instructions}>
        <p>Open two tabs with this page to test the video call functionality.</p>
        <p>Click "Start Call" in both tabs to establish a connection.</p>
      </div>
      
      <div style={styles.controls}>
        {!myStream ? (
          <button
            onClick={startVideoCall}
            style={{ ...styles.button, ...styles.startButton }}
            disabled={!isConnected}
            aria-disabled={!isConnected}
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endVideoCall}
            style={{ ...styles.button, ...styles.endButton }}
          >
            End Call
          </button>
        )}
      </div>
      
      <div style={styles.videoGrid}>
        {myStream && (
          <div style={styles.videoContainer}>
            <video
              ref={myVideo}
              autoPlay
              muted
              playsInline
              style={styles.video}
            />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white' }}>
              You
            </div>
          </div>
        )}
        
        {remotePeerIds.map(peerId => (
          <div key={peerId} style={styles.videoContainer}>
            <video
              ref={el => {
                if (el) remoteVideos.current[peerId] = el;
              }}
              autoPlay
              playsInline
              style={styles.video}
            />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white' }}>
              Remote User
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoCall;