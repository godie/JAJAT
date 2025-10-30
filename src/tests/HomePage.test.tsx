import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { GoogleOAuthProvider } from '@react-oauth/google';

// =========================================================================
// 1. MOCK: Configuración del Mock para localStorage
// =========================================================================
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    getStore: () => store, 
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Helper function to render with GoogleOAuthProvider
const renderWithGoogleProvider = (ui: React.ReactElement) => {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      {ui}
    </GoogleOAuthProvider>
  );
};

// =========================================================================
// 2. UTILIDAD: Función para crear y guardar una aplicación (DRY Principle)
// =========================================================================
interface TestApplicationData {
    position: string;
    company: string;
    status: string;
    platform: string;
}

const createAndSaveApplication = async (
    data: TestApplicationData
) => {
    const addButton = screen.getByTestId('add-entry-button');
    const formTitleText = /Add New Job Application/i;
    const TEST_DATE = '2025-10-16';

    // 1. Abrir el formulario
    fireEvent.click(addButton);
    const formTitle = screen.getByText(formTitleText);
    expect(formTitle).toBeInTheDocument();
    
    // 2. Mockear la limpieza de llamadas después de la apertura para aislar el contador del guardado
    //localStorageMock.setItem.mockClear();

    // 3. Obtener inputs y llenar campos clave
    const positionInput = screen.getByTestId('form-position');
    const companyInput = screen.getByTestId('form-company');
    const applicationDateInput = screen.getByTestId('form-application-date');
    const statusSelect = screen.getByTestId('form-status');
    const platformSelect = screen.getByTestId('form-platform');
    const saveButton = screen.getByTestId('form-save');
    
    fireEvent.change(positionInput, { target: { value: data.position } });
    fireEvent.change(companyInput, { target: { value: data.company } });
    fireEvent.change(applicationDateInput, { target: { value: TEST_DATE } });
    fireEvent.change(statusSelect, { target: { value: data.status } });
    fireEvent.change(platformSelect, { target: { value: data.platform } });

    // 4. Guardar la aplicación
    fireEvent.click(saveButton);

    // 5. Esperar el cierre del formulario
    await waitFor(() => {
        expect(screen.queryByText(formTitleText)).not.toBeInTheDocument();
    }, { timeout: 2000 });
};


// =========================================================================
// 3. ESTRUCTURA DE TESTS
// =========================================================================

// Configuración de columnas para evitar repetición
const requiredColumns = [
    'Position', 'Company', 'Salary', 'Status', 'Application Date', 
    'Interview Date', 'Platform', 'Contact Name', 'Follow-up Date', 'Notes', 'Link'
];

test('HomePage renders correctly and matches snapshot', () => {
  const { container } = renderWithGoogleProvider(<HomePage />);
  expect(container).toMatchSnapshot();
});

describe('HomePage Core Requirements (Static Content)', () => {
  
  beforeEach(() => {
    renderWithGoogleProvider(<HomePage />);
  });

  test('renders the application title, login button, and add entry button', () => {
    // Título
    expect(screen.getByText(/Just Another Job Application Tracker/i)).toBeInTheDocument();
    
    // Botones
    expect(screen.getByRole('button', { name: /Login with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Add new application entry" })).toBeInTheDocument();
  });

  test('renders the table with all required 11 columns', () => {
    requiredColumns.forEach(column => {
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    });
  });

  test('renders the summary metrics placeholders', () => {
    const applicationMetrics = screen.getAllByText(/Applications/i);
    expect(applicationMetrics.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Interviews/i)).toBeInTheDocument();
  });
});

describe('HomePage Core Functionality and Persistence', () => {
  
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('isLoggedIn', 'false');
    renderWithGoogleProvider(<HomePage />);
  });

  // Test que verifica el flujo completo de guardado
  test('Single entry: Form submission saves data to localStorage and updates table', async () => {
    localStorageMock.setItem.mockClear();
    await createAndSaveApplication({ 
        position: 'QA Tester', 
        company: 'Agile Corp', 
        status: 'Interviewing',
        platform: 'Indeed'
    });

    // 1. Verificación de Persistencia
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1); 
    const savedData = JSON.parse(localStorageMock.getItem('jobTrackerData')!);
    
    expect(savedData).toHaveLength(1);
    expect(savedData[0].position).toBe('QA Tester');
    expect(savedData[0].status).toBe('Interviewing');
    
    // 2. Verificación de Actualización de Tabla
    expect(screen.getByText(/QA Tester/i)).toBeInTheDocument();
  });

  // 💡 NUEVO TEST: Agregar Múltiples Registros en un Loop
  test('Adding multiple entries successfully updates the table and localStorage', async () => {
    const testApplications: TestApplicationData[] = [
        { position: 'DevOps Eng', company: 'CloudWorks', status: 'Applied', platform: 'LinkedIn' },
        { position: 'UX Designer', company: 'DesignCo', status: 'Offer', platform: 'Company Website' },
        { position: 'Data Scientist', company: 'DataLabs', status: 'Rejected', platform: 'Referral' },
    ];
    
    // Ejecutar el loop y verificar las llamadas a localStorage
    localStorageMock.setItem.mockClear();
    for (const [index, app] of testApplications.entries()) {
        await createAndSaveApplication(app);
        
        // Verificación dentro del loop: asegurar que el nuevo registro aparece
        expect(screen.getByText(app.position)).toBeInTheDocument();
        
        // La primera entrada es 1, la segunda es 2, etc.
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(index + 1); 
    }
    
    // Verificación final: el array de localStorage debe tener 3 elementos
    const finalSavedData = JSON.parse(localStorageMock.getItem('jobTrackerData')!);
    expect(finalSavedData).toHaveLength(testApplications.length);
    //expect(finalSavedData.map(a => a.company)).toEqual(['CloudWorks', 'DesignCo', 'DataLabs']);
  });
});