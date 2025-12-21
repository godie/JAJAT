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
  it('renders the MainLayout component', () => {
    render(<App />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});
