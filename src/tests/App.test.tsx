// src/tests/App.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock MainLayout
vi.mock('../layouts/MainLayout', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
  };
});

// Mock GoogleOAuthProvider
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the landing page by default', () => {
    render(<App />);
    expect(screen.getByText(/Master Your Job Search/i)).toBeInTheDocument();
  });
});
