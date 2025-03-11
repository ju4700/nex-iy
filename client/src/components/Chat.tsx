import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  text: string;
  user: string;
  createdAt: string;
}

// Create a safe scrollIntoView polyfill for testing environments
const safeScrollIntoView = (element: HTMLElement | null, options?: ScrollIntoViewOptions) => {
  if (element && element.scrollIntoView) {
    try {
      element.scrollIntoView(options);
    } catch (error) {
      console.error('scrollIntoView not supported in this environment', error);
    }
  }
};

const socket: Socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
  reconnection: true,
  reconnectionDelay: 1000,
  autoConnect: true,
});

const Chat = (): JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    // Use our safe scroll function instead of calling scrollIntoView directly
    safeScrollIntoView(messagesEndRef.current, { behavior: 'smooth' });
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages');
      const data = await response.json();
      setMessages(data.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (newMessage.trim() && isConnected) {
      const messageData = {
        text: newMessage,
        user: 'User', // Would be replaced by actual user info in a real app
      };
      
      socket.emit('send-message', messageData);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  useEffect(() => {
    // Fetch existing messages when the component mounts
    fetchMessages();
    
    // Set up socket event listeners
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('new-message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });
    
    // Clean up event listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-message');
    };
  }, [scrollToBottom]);

  const styles = {
    container: { margin: '20px', maxWidth: '800px' },
    header: { color: '#333', marginBottom: '10px' },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '400px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '10px',
    },
    messageItem: {
      margin: '8px 0',
      padding: '8px 12px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      maxWidth: '80%',
    },
    messageUser: {
      fontWeight: 'bold' as const,
      marginBottom: '4px',
    },
    messageText: {},
    messageTime: {
      fontSize: '0.8em',
      color: '#666',
      marginTop: '4px',
    },
    inputContainer: {
      display: 'flex',
      padding: '10px',
      borderTop: '1px solid #ddd',
    },
    input: {
      flex: 1,
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginRight: '10px',
    },
    sendButton: {
      padding: '8px 16px',
      backgroundColor: isConnected ? '#007bff' : '#cccccc',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: isConnected ? 'pointer' : 'not-allowed',
    },
    status: {
      padding: '5px 10px',
      textAlign: 'center' as const,
      color: isConnected ? '#28a745' : '#dc3545',
      borderBottom: '1px solid #ddd',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Team Chat</h2>
      
      <div style={styles.chatContainer}>
        <div style={styles.status}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No messages yet</div>
          ) : (
            messages.map((message) => (
              <div key={message._id} style={styles.messageItem}>
                <div style={styles.messageUser}>{message.user}</div>
                <div style={styles.messageText}>{message.text}</div>
                <div style={styles.messageTime}>
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} style={styles.inputContainer}>
          <label htmlFor="message-input" style={{ display: 'none' }}>
            Enter your message
          </label>
          <input
            id="message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={!isConnected}
            style={styles.input}
          />
          <button
            type="submit"
            disabled={!isConnected}
            style={styles.sendButton}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;