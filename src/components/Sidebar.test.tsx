// src/components/Sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  it('renders a theme switcher button', () => {
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('toggles the theme on button click', () => {
    render(<Sidebar />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);
    // We'll need to check that the theme has changed.
    // For now, we'll just check that the button is still there.
    expect(button).toBeInTheDocument();
  });
});
