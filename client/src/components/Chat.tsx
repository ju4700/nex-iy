import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../store/user';
import '../styles/chat.css';

const socket = io('http://localhost:5000');

const Chat = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    socket.emit('joinRoom', roomId);
    fetch(`http://localhost:5000/api/chat/${roomId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.on('message', (message) => setMessages((prev) => [...prev, message]));
    return () => { socket.off('message'); };
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('sendMessage', { roomId, message: input, userId: user?.id });
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <h2>Team Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.userId._id === user?.id ? 'message-sent' : 'message-received'}`}
          >
            <span className="message-user">{msg.userId.name}</span>
            <p>{msg.message}</p>
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;