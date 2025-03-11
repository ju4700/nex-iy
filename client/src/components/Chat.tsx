import { useState, useEffect, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message } from '../types';

const socket: Socket = io(`${process.env.VITE_API_URL}`, {
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

  const fetchMessages = useCallback(async (retryCount: number = 3): Promise<void> => {
    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await fetch(`${process.env.VITE_API_URL}/api/messages`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMessages(data.data.reverse());
        setError(null);
        scrollToBottom();
        break;
      } catch (err) {
        if (i === retryCount - 1) setError((err as Error).message);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, [scrollToBottom]);

  useEffect(() => {
    socket.connect();
    fetchMessages();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });
    socket.on('message', (msg: Message) => {
      setMessages((prev) => [msg, ...prev]);
      scrollToBottom();
    });
    socket.on('connect_error', (err: Error) => {
      console.error('Socket error:', err.message);
      setError('Connection failed. Retrying...');
    });
    socket.on('error', (err: { message: string }) => setError(err.message));

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('connect_error');
      socket.off('error');
      socket.disconnect();
    };
  }, [fetchMessages, scrollToBottom]);

  const sendMessage = useCallback((): void => {
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ margin: '20px', maxWidth: '600px' }} role="region" aria-label="Team Chat">
      <h2 style={{ color: '#333', marginBottom: '10px' }}>
        Team Chat {isConnected ? '✅' : '❌'}
      </h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }} role="alert">{error}</p>}
      <div
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          background: '#f9f9f9',
          borderRadius: '4px',
        }}
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <p
            key={msg._id}
            style={{
              margin: '5px 0',
              padding: '8px',
              background: '#fff',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {msg.content}{' '}
            <span style={{ color: '#888', fontSize: '0.8em' }}>
              ({new Date(msg.timestamp).toLocaleTimeString()})
            </span>
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <label htmlFor="chat-input" style={{ display: 'none' }}>Enter your message</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1em',
          }}
          disabled={!isConnected}
          aria-disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
          }}
          disabled={!isConnected}
          aria-disabled={!isConnected}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;