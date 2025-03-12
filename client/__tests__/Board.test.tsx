import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Board from '../src/components/Board';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../src/types', () => ({
  Task: {
    _id: String,
    title: String,
    status: String
  }
}));

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
    default: vi.fn(() => mockSocket),
    io: vi.fn(() => mockSocket),
  };
});

vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: any }) => children({ innerRef: () => {}, droppableProps: {} }),
  Draggable: ({ children }: { children: any }) => children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: () => ({}),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response)
);

describe('Board Component', () => {
  it('renders without crashing', () => {
    act(() => {
      render(<Board />);
    });
    expect(screen.getByText('Planning Board')).toBeInTheDocument();
  });

  it('adds a task', async () => {
    act(() => {
      render(<Board />);
    });
    const input = screen.getByLabelText(/Add a new task/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'New Task' } });
      fireEvent.click(screen.getByText('Add'));
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks', expect.objectContaining({ method: 'POST' }))
    );
  });

  it('adds a task on Enter key', async () => {
    act(() => {
      render(<Board />);
    });
    const input = screen.getByLabelText(/Add a new task/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'New Task' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks', expect.objectContaining({ method: 'POST' }))
    );
  });
});