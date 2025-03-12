import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const Message = styled.div`
  color: #28a745;
`;

const Error = styled.div`
  color: #dc3545;
`;

const VerifyEmail: FC = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        setError('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setMessage(response.data.message);
      } catch (err) {
        setError('Failed to verify email');
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <Container>
      <h2>Email Verification</h2>
      {message && <Message>{message}</Message>}
      {error && <Error>{error}</Error>}
    </Container>
  );
};

export default VerifyEmail;