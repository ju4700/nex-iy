import React from 'react';
import { render, screen, act } from '@testing-library/react';
import VideoCall from '../src/components/VideoCall';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  };
  return {
    default: vi.fn(() => mockSocket),
    io: vi.fn(() => mockSocket),
  };
});

vi.mock('simple-peer', () => {
  return {
    default: vi.fn(() => ({
      on: vi.fn(),
      signal: vi.fn(),
      destroy: vi.fn(),
    }))
  };
});

describe('VideoCall Component', () => {
  it('renders without crashing', () => {
    act(() => {
      render(<VideoCall />);
    });
    expect(screen.getByText('Video Call')).toBeInTheDocument();
  });

  it('displays instructions', () => {
    act(() => {
      render(<VideoCall />);
    });
    expect(screen.getByText(/Open two tabs/i)).toBeInTheDocument();
  });
});