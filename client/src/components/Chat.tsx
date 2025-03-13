import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useUserStore } from '../store/user';
import axios from 'axios';
import '../styles/chat.css';

const socket = io('http://localhost:5000');

interface ChatProps {
  roomId?: string;
}

const Chat = ({ roomId = 'general' }: ChatProps) => {
  const [channels, setChannels] = useState<{ roomId: string; name: string }[]>([
    { roomId: 'general', name: 'General' },
  ]);
  const [activeChannel, setActiveChannel] = useState(roomId);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [threadMessage, setThreadMessage] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    socket.emit('joinRoom', activeChannel);
    axios.get(`http://localhost:5000/api/chat/${activeChannel}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => setMessages(res.data));

    socket.on('message', (message) => setMessages((prev) => [...prev, message]));
    return () => { socket.off('message'); };
  }, [activeChannel]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('sendMessage', {
        roomId: activeChannel,
        message: input,
        userId: user?.id,
        threadId: threadMessage ? activeChannel + '-' + threadMessage : null,
      });
      setInput('');
      setThreadMessage(null);
    }
  };

  const createChannel = async () => {
    if (newChannelName.trim()) {
      const { data } = await axios.post('http://localhost:5000/api/chat/channel', { name: newChannelName }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setChannels((prev) => [...prev, data]);
      setNewChannelName('');
    }
  };

  const startThread = (messageId: string) => {
    setThreadMessage(messageId);
  };

  return (
    <div className="chat-wrapper">
      <motion.div
        className="channel-sidebar card"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3>Channels</h3>
        <ul>
          {channels.map((channel) => (
            <motion.li
              key={channel.roomId}
              onClick={() => setActiveChannel(channel.roomId)}
              whileHover={{ scale: 1.05 }}
              className={channel.roomId === activeChannel ? 'active' : ''}
            >
              # {channel.name}
            </motion.li>
          ))}
        </ul>
        <div className="new-channel">
          <input
            className="form-input"
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="New channel name"
          />
          <button className="btn btn-primary" onClick={createChannel}>Add</button>
        </div>
      </motion.div>
      <div className="chat-main">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          #{channels.find(c => c.roomId === activeChannel)?.name || 'Chat'}
        </motion.h2>
        <div className="chat-messages">
          {messages.filter(m => !m.threadId).map((msg, idx) => (
            <motion.div
              key={idx}
              className="message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="message-header">
                <span className="message-user">{msg.userId.name}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p>{msg.message}</p>
              <button className="thread-btn" onClick={() => startThread(msg._id)}>Reply</button>
              {messages.filter(t => t.threadId === `${activeChannel}-${msg._id}`).length > 0 && (
                <div className="thread">
                  {messages.filter(t => t.threadId === `${activeChannel}-${msg._id}`).map((threadMsg, tIdx) => (
                    <div key={tIdx} className="thread-message">
                      <span>{threadMsg.userId.name}: </span>{threadMsg.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="chat-input"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <input
            className="form-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={threadMessage ? 'Reply in thread...' : 'Type a message...'}
          />
          <button className="btn btn-primary" onClick={sendMessage}>Send</button>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;