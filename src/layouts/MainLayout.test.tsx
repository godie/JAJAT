// src/layouts/MainLayout.test.tsx
import { render, screen } from '@testing-library/react';
import MainLayout from './MainLayout';

describe('MainLayout', () => {
  it('renders children correctly', () => {
    render(
      <MainLayout>
        <div>Test Child</div>
      </MainLayout>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});
