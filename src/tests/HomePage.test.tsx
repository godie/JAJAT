// src/tests/HomePage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { expect, test, describe, beforeEach, vi } from 'vitest';

// 💡 1. Configuración de Mock para localStorage
// Esta es la implementación crucial para TDD con persistencia
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    // Acceso para inspección en los tests
    getStore: () => store, 
  };
})();

// Reemplazar global.localStorage con nuestro mock
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Requisito 6.4: Snapshot test for the main page.
test('HomePage renders correctly and matches snapshot', () => {
  const { container } = render(<HomePage />);
  // Un snapshot es vital para asegurar que los cambios de diseño no rompan la estructura.
  expect(container).toMatchSnapshot();
});

describe('HomePage Core Requirements', () => {
  
  beforeEach(() => {
    // Renderizar antes de cada prueba para limpieza
    render(<HomePage />);
  });

  // Requisito 6.1: Rendering the header and title.
  test('renders the application header and the correct title', () => {
    // Usar getByRole y getByTestId (del Header.tsx) para verificar el título
    expect(screen.getByText(/Job Application Tracker/i)).toBeInTheDocument();
  });
  
  test('renders the "Login with Google" button in the header', () => {
    // Verificar el botón de la cabecera
    const loginButton = screen.getByRole('button', { name: /Login with Google/i });
    expect(loginButton).toBeInTheDocument();
  });

  // Requisito 6.3: Ensuring the "Add Entry" button is visible.
  test('renders the "+ Add Entry" button for adding new applications', () => {
    const addButton = screen.getByRole('button', { name: "Add new application entry" });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeVisible();
  });

  // Requisito 6.2: Rendering the table with correct columns.
  test('renders the application table with all required columns', () => {
    const requiredColumns = [
      'Position',
      'Company',
      'Salary',
      'Status',
      'Application Date',
      'Interview Date',
      'Platform',
      'Contact Name',
      'Follow-up Date',
      'Notes',
      'Link',
    ];

    // Verificar que todos los encabezados de columna estén presentes
    requiredColumns.forEach(column => {
      // Buscar por el rol 'columnheader' con el texto de la columna
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    });
  });

  test('renders the summary metrics placeholders', () => {
    // Verificar que se rendericen los 3 placeholders de métricas
    const applicationMetrics = screen.getAllByText(/Applications/i);
    expect(applicationMetrics.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Interviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Offers/i)).toBeInTheDocument();
  });
});

describe('HomePage Core Functionality and Persistence', () => {
  
  beforeEach(() => {
    // Resetear el store y el componente antes de cada prueba
    localStorageMock.clear();
    localStorageMock.setItem('isLoggedIn', 'false'); // Estado inicial de login
    render(<HomePage />);
  });

  // Requisito 7.1: Rendering the header and login button
  test('renders the header, title, and Login button', () => {
    expect(screen.getByText(/Job Application Tracker/i)).toBeInTheDocument();
    
    // Verificar que el botón de Login/Logout esté visible
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Login with Google'); // Estado inicial
  });

  // Requisito 7.2: Rendering the table with correct columns
  test('renders the application table with all 11 required columns', () => {
    const requiredColumns = [
      'Position', 'Company', 'Salary', 'Status', 'Application Date', 
      'Interview Date', 'Platform', 'Contact Name', 'Follow-up Date', 'Notes', 'Link'
    ];
    requiredColumns.forEach(column => {
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    });
  });

  // Requisito 7.3: Adding a new job entry updates localStorage
  test('clicking "+ Add Entry" button adds a new entry and persists it to localStorage', async () => {
    //const { rerender } = render(<HomePage />);
    localStorageMock.setItem.mockClear();
    const addButton = screen.getByTestId('add-entry-button');
    
    // 1. Verificar el estado inicial: localStorage debe estar vacío
    expect(localStorageMock.getItem('jobTrackerData')).toBeNull();

    // 2. Simular la adición de una entrada
    fireEvent.click(addButton);

    // 3. Esperar que React actualice el estado del componente (la tabla)
    await waitFor(() => {
        expect(screen.getByText(/New Position 1/i)).toBeInTheDocument();
    });

    // 4. Verificar el localStorage mock: debe tener 1 elemento
    const savedData = JSON.parse(localStorageMock.getItem('jobTrackerData')!);
    
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1); // La función saveApplications fue llamada
    expect(savedData).toHaveLength(1);
    expect(savedData[0].company).toBe('Placeholder Co.');
    expect(savedData[0].platform).toBe('LinkedIn'); 
    expect(savedData[0].contactName).toBe('N/A');

    // 5. Simular la adición de una segunda entrada
    fireEvent.click(addButton);
    
    // 6. Verificar que el array se actualizó a 2 elementos
    const updatedData = JSON.parse(localStorageMock.getItem('jobTrackerData')!);
    expect(updatedData).toHaveLength(2);
  });
});

// Requisito 7.4: Snapshot test for the main page.
// 💡 NOTA: Debes ejecutar 'npm test -- -u' para actualizar el snapshot
test('HomePage renders correctly and matches snapshot', () => {
  const { container } = render(<HomePage />);
  expect(container).toMatchSnapshot();
});