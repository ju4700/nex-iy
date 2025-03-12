import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from '../src/components/Chat';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

// Mock scrollIntoView which isn't implemented in JSDOM
Element.prototype.scrollIntoView = vi.fn();

// Mock socket.io-client with a factory pattern to avoid hoisting issues
vi.mock('socket.io-client', () => {
  const mockSocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: true,
  };
  
  return {
    io: vi.fn(() => mockSocket),
    __getMockSocket: () => mockSocket 
  };
});

const ioModule = await import('socket.io-client');
const mockSocket = (ioModule as any).__getMockSocket();

// Mock global fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
    status: 200,
  } as Response)
);

describe('Chat Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockSocket.connected = true;
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<Chat />);
      await Promise.resolve();
    });
    expect(screen.getByText('Team Chat')).toBeInTheDocument();
  });

  it('disables input when disconnected', async () => {
    mockSocket.connected = false;
    await act(async () => {
      render(<Chat />);
      await Promise.resolve();
    });
    const input = screen.getByLabelText(/Enter your message/i);
    expect(input).toBeDisabled();
  });

  it('fetches messages on mount', async () => {
    await act(async () => {
      render(<Chat />);
      await Promise.resolve();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/messages');
  });

  it('sends a message on button click', async () => {
    await act(async () => {
      render(<Chat />);
      await Promise.resolve();
    });
    
    const input = screen.getByLabelText(/Enter your message/i);
    const button = screen.getByText('Send');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.click(button);
      await Promise.resolve();
    });
    
    expect(input).toHaveValue('');
    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', {
      text: 'Hello',
      user: 'User',
    });
  });

  it('sends a message on Enter key', async () => {
    await act(async () => {
      render(<Chat />);
      await Promise.resolve();
    });
    
    const input = screen.getByLabelText(/Enter your message/i);
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      await Promise.resolve();
    });
    
    expect(input).toHaveValue('');
    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', {
      text: 'Hello',
      user: 'User',
    });
  });
});