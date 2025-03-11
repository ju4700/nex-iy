import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the Message type
interface Message {
  user: string;
  text: string;
  timestamp: string;
}

const socket: Socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false,
});

const Chat = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  const handleSendMessage = () => {
    if (input.trim() && socket.connected) {
      socket.emit('message', input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && socket.connected) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });

    fetchMessages();

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const styles = {
    container: { margin: '20px', maxWidth: '600px' },
    header: { color: '#333', marginBottom: '10px' },
    messageList: {
      height: '300px',
      overflowY: 'auto',
      border: '1px solid #ccc',
      padding: '10px',
      background: '#f9f9f9',
      borderRadius: '4px',
    },
    message: { margin: '5px 0' },
    inputContainer: { marginTop: '10px', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1em' },
    button: {
      padding: '8px 16px',
      background: '#007bff',
      color: '#fff',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1em',
    },
  } as const;

  const isTest = process.env.NODE_ENV === 'test';

  return (
    <div role="region" aria-label="Team Chat" style={styles.container}>
      <h2 style={styles.header}>
        Team Chat {(!isTest && error) && '❌'}
      </h2>
      <div role="log" aria-live="polite" style={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            <strong>{msg.user}</strong>: {msg.text} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputContainer}>
        <label htmlFor="chat-input" style={{ display: 'none' }}>
          Enter your message
        </label>
        <input
          id="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          aria-disabled={!isConnected}
          style={styles.input}
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected}
          aria-disabled={!isConnected}
          style={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;