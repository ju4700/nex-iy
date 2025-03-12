import { FC, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';

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

const ResetPassword: FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Invalid reset link');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError('Failed to reset password');
      setMessage('');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        required
      />
      <Button type="submit">Reset Password</Button>
      {message && <Message>{message}</Message>}
      {error && <Error>{error}</Error>}
    </Form>
  );
};

export default ResetPassword;