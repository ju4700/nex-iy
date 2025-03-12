import { FC, useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const Message = styled.div`
  color: #28a745;
`;

const Error = styled.div`
  color: #dc3545;
`;

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError('Failed to send reset email');
      setMessage('');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <Button type="submit">Send Reset Email</Button>
      {message && <Message>{message}</Message>}
      {error && <Error>{error}</Error>}
    </Form>
  );
};

export default ForgotPassword;