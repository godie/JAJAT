// src/tests/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../layouts/MainLayout', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
  };
});

describe('App', () => {
  it('renders the MainLayout component', () => {
    render(<App />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});
