import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  } as Response)
);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    render(<App />);

    const navLinks = screen.getAllByRole('link');
    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toHaveTextContent('Attendance');
    expect(navLinks[1]).toHaveTextContent('Logs');
  });
});
