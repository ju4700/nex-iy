import { FC, useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@utils/auth';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
`;

const Message = styled.div`
  margin: 5px 0;
  padding: 5px;
  background: white;
  border-radius: 4px;
`;

const InputArea = styled.form`
  display: flex;
  gap: 10px;
  padding: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const Chat: FC = () => {
  const { user, token, selectedTeam } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && selectedTeam) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join-team', { userId: user.id, teamId: selectedTeam, token });
      });

      newSocket.on('new-message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedTeam, token]);

  useEffect(() => {
    if (selectedTeam) {
      fetch(`http://localhost:5000/api/messages/${selectedTeam}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setMessages(data.data || []));
    }
  }, [selectedTeam, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message && socket && selectedTeam) {
      socket.emit('send-message', { text: message, userId: user?.id, teamId: selectedTeam });
      setMessage('');
    }
  };

  if (!selectedTeam) return <div>Select a team to chat</div>;

  return (
    <ChatContainer>
      <Messages>
        {messages.map((msg) => (
          <Message key={msg._id}>{msg.text} - {msg.user}</Message>
        ))}
        <div ref={messagesEndRef} />
      </Messages>
      <InputArea onSubmit={handleSubmit}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </InputArea>
    </ChatContainer>
  );
};

export default Chat;