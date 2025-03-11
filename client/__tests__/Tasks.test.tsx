import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Tasks from '../src/components/Tasks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock implementation for the debounce utility to make tests predictable
vi.mock('../src/utils/debounce', () => ({
  debounce: (fn: Function) => fn, // Replace debounce with immediate execution for testing
}));

// Mock fetch globally but allow customization per test
global.fetch = vi.fn();

describe('Tasks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default fetch mock implementation
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          data: { 
            data: [], 
            total: 0, 
            page: 1, 
            limit: 5 
          } 
        }),
        headers: new Headers(),
        status: 200,
      })
    );
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<Tasks />);
    });
    expect(screen.getByText('Task List')).toBeInTheDocument();
  });

  it('fetches tasks on mount', async () => {
    await act(async () => {
      render(<Tasks />);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/tasks?page=1&limit=5&filter=&sort=asc',
        expect.any(Object)
      );
    });
  });

  it('updates filter and resets page', async () => {
    await act(async () => {
      render(<Tasks />);
    });
    
    const input = screen.getByLabelText(/Filter tasks/i);
    
    // Reset fetch mock to track the next call
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    
    expect(input).toHaveValue('test');
    
    // Since we mocked debounce to run immediately, we can check right away
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('filter=test'),
      expect.any(Object)
    );
  });

  it('toggles sort order', async () => {
    await act(async () => {
      render(<Tasks />);
    });
    
    const sortButton = screen.getByLabelText(/Sort by date/i);
    expect(sortButton).toHaveTextContent('Sort ↑');
    
    // Reset fetch mock to track the next call
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    
    await act(async () => {
      fireEvent.click(sortButton);
    });
    
    expect(sortButton).toHaveTextContent('Sort ↓');
    
    // Check if change in sort order triggered a fetch
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('sort=desc'),
      expect.any(Object)
    );
  });
});