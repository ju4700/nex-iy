import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

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
  const [peers, setPeers] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [error, setError] = useState<string | null>(null);
  const [isSimplePeerLoaded, setIsSimplePeerLoaded] = useState<boolean>(false);
  const [SimplePeer, setSimplePeer] = useState<any>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideos = useRef<Record<string, HTMLVideoElement>>({});
  const peersRef = useRef<Record<string, any>>({});

  // Load SimplePeer dynamically inside useEffect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('simple-peer')
      .then((module) => {
        setSimplePeer(module.default);
        setIsSimplePeerLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load simple-peer:", err);
        setError("WebRTC library could not be loaded. Video calls are not available.");
        setIsSimplePeerLoaded(false);
      });
  }, []);

  const createPeer = useCallback((target: string, caller: string, stream: MediaStream | null): any => {
    if (!SimplePeer) {
      setError("WebRTC library not loaded. Please refresh the page.");
      return null;
    }

    try {
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

      peer.on('error', (err: Error) => {
        console.error('Peer connection error:', err);
        setError(`Connection error: ${err.message}`);
      });

      return peer;
    } catch (err) {
      console.error("Error creating peer:", err);
      setError("Failed to create peer connection. WebRTC may not be supported in this browser.");
      return null;
    }
  }, [SimplePeer]);

  useEffect(() => {
    if (!isSimplePeerLoaded) return;

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setError('Disconnected from server');
    };

    const handleConnectError = (err: Error) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    };

    const handleUserJoined = (userId: string) => {
      if (myStream && socket.id) {
        const peer = createPeer(userId, socket.id, myStream);
        if (peer) {
          setPeers((prevPeers) => ({
            ...prevPeers,
            [userId]: peer,
          }));
          peersRef.current[userId] = peer;
          setRemotePeerIds((prev) => [...prev, userId]);
        }
      }
    };

    const handleUserLeft = (userId: string) => {
      if (peersRef.current[userId]) {
        try {
          peersRef.current[userId].destroy();
        } catch (err) {
          console.error("Error destroying peer:", err);
        }

        setPeers((prevPeers) => {
          const updatedPeers = { ...prevPeers };
          delete updatedPeers[userId];
          return updatedPeers;
        });

        delete peersRef.current[userId];
        setRemotePeerIds((prev) => prev.filter((id) => id !== userId));
      }
    };

    const handleSignal = ({ from, signal }: { from: string; signal: PeerSignal }) => {
      if (peersRef.current[from]) {
        try {
          peersRef.current[from].signal(signal);
        } catch (err) {
          console.error('Error signaling peer:', err);
        }
      }
    };

    const handleUsersAlreadyConnected = (userIds: string[]) => {
      if (myStream && socket.id) {
        userIds.forEach((userId) => {
          const peer = createPeer(userId, socket.id!, myStream);
          if (peer) {
            setPeers((prevPeers) => ({
              ...prevPeers,
              [userId]: peer,
            }));
            peersRef.current[userId] = peer;
            setRemotePeerIds((prev) => [...prev, userId]);
          }
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('signal', handleSignal);
    socket.on('user-already-connected', handleUsersAlreadyConnected);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('signal', handleSignal);
      socket.off('user-already-connected', handleUsersAlreadyConnected);

      if (myStream) {
        myStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.error(e);
          }
        });
      }

      Object.values(peersRef.current).forEach((peer) => {
        if (peer) {
          try {
            peer.destroy();
          } catch (e) {
            console.error(e);
          }
        }
      });
    };
  }, [myStream, createPeer, isSimplePeerLoaded]);

  const startVideoCall = async () => {
    if (!isSimplePeerLoaded) {
      setError("Video call functionality is not available. WebRTC library could not be loaded.");
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMyStream(stream);

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

      socket.emit('join-video-call');
      setError(null);
    } catch (err: any) {
      console.error('Failed to access media devices:', err);
      let errorMessage = 'Failed to access camera or microphone. ';

      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow access to your camera and microphone.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect these devices and try again.';
      } else {
        errorMessage += 'Please make sure your devices are connected and permissions are granted.';
      }

      setError(errorMessage);
    }
  };

  const endVideoCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error(e);
        }
      });
      setMyStream(null);
    }

    Object.values(peersRef.current).forEach((peer) => {
      if (peer) {
        try {
          peer.destroy();
        } catch (e) {
          console.error(e);
        }
      }
    });

    peersRef.current = {};
    setPeers({});
    setRemotePeerIds([]);
    socket.emit('leave-video-call');
    setError(null);
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
      paddingBottom: '56.25%',
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
    placeholder: {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontSize: '16px',
    },
    status: {
      marginBottom: '10px',
      padding: '5px 10px',
      borderRadius: '4px',
      display: 'inline-block',
    },
    statusConnected: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    statusDisconnected: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Video Call</h2>

      <div style={{ marginBottom: '10px' }}>
        <span
          style={{
            ...styles.status,
            ...(isConnected ? styles.statusConnected : styles.statusDisconnected),
          }}
        >
          {isConnected ? 'Connected to server' : 'Disconnected from server'}
        </span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.instructions}>
        <p>Open two tabs with this page to test the video call functionality.</p>
        <p>Click "Start Call" in both tabs to establish a connection.</p>
        {!isSimplePeerLoaded && (
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
            WebRTC support is required for video calls. Your browser may not support this feature.
          </p>
        )}
      </div>

      <div style={styles.controls}>
        {!myStream ? (
          <button
            onClick={startVideoCall}
            style={{
              ...styles.button,
              ...styles.startButton,
              opacity: !isConnected || !isSimplePeerLoaded ? 0.5 : 1,
            }}
            disabled={!isConnected || !isSimplePeerLoaded}
          >
            Start Call
          </button>
        ) : (
          <button onClick={endVideoCall} style={{ ...styles.button, ...styles.endButton }}>
            End Call
          </button>
        )}
      </div>

      <div style={styles.videoGrid}>
        <div style={styles.videoContainer}>
          {myStream ? (
            <video ref={myVideo} autoPlay muted playsInline style={styles.video} />
          ) : (
            <div style={styles.placeholder}>Camera Off</div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            You
          </div>
        </div>

        {remotePeerIds.length > 0 ? (
          remotePeerIds.map((peerId) => (
            <div key={peerId} style={styles.videoContainer}>
              <video
                ref={(el) => {
                  if (el) remoteVideos.current[peerId] = el;
                }}
                autoPlay
                playsInline
                style={styles.video}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Remote User
              </div>
            </div>
          ))
        ) : myStream ? (
          <div style={styles.videoContainer}>
            <div style={styles.placeholder}>Waiting for others to join...</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default VideoCall;