// src/pages/InsightsPage.test.tsx
import { render, screen } from '@testing-library/react';
import InsightsPage from './InsightsPage';

describe('InsightsPage', () => {
  it('renders a placeholder', () => {
    render(<InsightsPage />);
    expect(screen.getByText('Insights Page')).toBeInTheDocument();
  });
});
