import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SupportPage from '../pages/SupportPage';
import { AlertProvider } from '../components/AlertProvider';

// Mock clipboard
const mockWriteText = vi.fn().mockImplementation(() => Promise.resolve());
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  configurable: true,
});

describe('SupportPage', () => {
  it('renders correctly', () => {
    render(
      <AlertProvider>
        <SupportPage />
      </AlertProvider>
    );

    expect(screen.getByText('Comunidad y Soporte')).toBeInTheDocument();
    expect(screen.getByText('Donaciones')).toBeInTheDocument();
    expect(screen.getByText('Sugerencias')).toBeInTheDocument();
    expect(screen.getByText('Buy Me a Coffee')).toBeInTheDocument();
  });

  it('allows selecting suggestion types', () => {
    render(
      <AlertProvider>
        <SupportPage />
      </AlertProvider>
    );

    const uiuxCheckbox = screen.getByLabelText('UI/UX');
    fireEvent.click(uiuxCheckbox);

    // Check if it's "selected" (it should have a specific class or be checked if it was a real checkbox,
    // but here we used a label with a hidden input)
    // The label gets the 'bg-indigo-600' class when selected
    expect(uiuxCheckbox.closest('label')).toHaveClass('bg-indigo-600');
  });

  it('updates explanation text', () => {
    render(
      <AlertProvider>
        <SupportPage />
      </AlertProvider>
    );

    const textarea = screen.getByPlaceholderText(/Cuéntanos más sobre tu idea/i);
    fireEvent.change(textarea, { target: { value: 'Nueva funcionalidad increíble' } });

    expect(textarea).toHaveValue('Nueva funcionalidad increíble');
  });

  it('copies prompt to clipboard', async () => {
    render(
      <AlertProvider>
        <SupportPage />
      </AlertProvider>
    );

    const textarea = screen.getByPlaceholderText(/Cuéntanos más sobre tu idea/i);
    fireEvent.change(textarea, { target: { value: 'Mejorar el diseño' } });

    const uiuxCheckbox = screen.getByLabelText('UI/UX');
    fireEvent.click(uiuxCheckbox);

    const copyButton = screen.getByText('Copiar para Jules');
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('Tipo: UI/UX')
    );
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('Explicación: Mejorar el diseño')
    );
  });
});
