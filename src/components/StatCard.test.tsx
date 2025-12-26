// src/components/StatCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Test Title" value={42} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(<StatCard title="Percentage" value="50%" />);
    expect(screen.getByText('Percentage')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with compact prop', () => {
    const { container } = render(<StatCard title="Compact Card" value={100} compact />);
    const card = container.firstChild as HTMLElement;
    
    // Check for compact classes
    expect(card.className).toContain('p-2');
    expect(card.className).toContain('sm:p-4');
    
    // Check for compact text sizes
    const title = screen.getByText('Compact Card');
    expect(title.className).toContain('text-xs');
    expect(title.className).toContain('sm:text-sm');
    
    const value = screen.getByText('100');
    expect(value.className).toContain('text-xl');
    expect(value.className).toContain('sm:text-3xl');
  });

  it('renders with default (non-compact) styling', () => {
    const { container } = render(<StatCard title="Normal Card" value={200} />);
    const card = container.firstChild as HTMLElement;
    
    // Check for default classes
    expect(card.className).toContain('p-4');
    expect(card.className).not.toContain('p-2');
    
    // Check for default text sizes
    const title = screen.getByText('Normal Card');
    expect(title.className).toContain('text-sm');
    expect(title.className).not.toContain('text-xs');
    
    const value = screen.getByText('200');
    expect(value.className).toContain('text-3xl');
    expect(value.className).not.toContain('text-xl');
  });

  it('applies dark mode classes', () => {
    const { container } = render(<StatCard title="Dark Card" value={300} />);
    const card = container.firstChild as HTMLElement;
    
    expect(card.className).toContain('dark:bg-gray-800');
    expect(screen.getByText('Dark Card').className).toContain('dark:text-gray-400');
    expect(screen.getByText('300').className).toContain('dark:text-white');
  });
});

