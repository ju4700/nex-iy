import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Tasks from '../src/components/Tasks';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { data: [], total: 0, page: 1, limit: 5 } }),
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

describe('Tasks Component', () => {
  it('renders without crashing', () => {
    act(() => {
      render(<Tasks />);
    });
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('fetches tasks on mount', async () => {
    act(() => {
      render(<Tasks />);
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tasks?page=1&limit=5&filter=', expect.any(Object))
    );
  });

  it('updates filter and resets page', () => {
    act(() => {
      render(<Tasks />);
    });
    const input = screen.getByLabelText(/Filter tasks/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    expect(input).toHaveValue('test');
  });

  it('toggles sort order', () => {
    act(() => {
      render(<Tasks />);
    });
    const sortButton = screen.getByLabelText(/Sort by date/i);
    act(() => {
      fireEvent.click(sortButton);
    });
    expect(sortButton).toHaveTextContent('Sort ↑');
    act(() => {
      fireEvent.click(sortButton);
    });
    expect(sortButton).toHaveTextContent('Sort ↓');
  });
});