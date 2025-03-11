import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '@components/Chat';
import { vi, describe, it, expect } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockSocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };
  return vi.fn(() => mockSocket);
});

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

describe('Chat Component', () => {
  it('renders without crashing', () => {
    render(<Chat />);
    expect(screen.getByText('Team Chat')).toBeInTheDocument();
  });

  it('disables input when disconnected', () => {
    render(<Chat />);
    const input = screen.getByLabelText(/Enter your message/i);
    expect(input).toBeDisabled();
  });

  it('fetches messages on mount', async () => {
    render(<Chat />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/messages'));
  });

  it('sends a message on button click', () => {
    render(<Chat />);
    const input = screen.getByLabelText(/Enter your message/i);
    const button = screen.getByText('Send');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);
    expect(input).toHaveValue('');
  });

  it('sends a message on Enter key', () => {
    render(<Chat />);
    const input = screen.getByLabelText(/Enter your message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(input).toHaveValue('');
  });
});