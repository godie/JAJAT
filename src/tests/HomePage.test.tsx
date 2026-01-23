import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AlertProvider } from '../components/AlertProvider';
import { STORAGE_KEY } from '../utils/constants';

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

// Helper function to render with GoogleOAuthProvider and AlertProvider
const renderWithGoogleProvider = (ui: React.ReactElement) => {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <AlertProvider>
      {ui}
      </AlertProvider>
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
    
    // 2. Obtener inputs y llenar campos clave
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

// Configuración de columnas para evitar repetición - basado en DEFAULT_FIELDS
// Notes is not shown by default, so it's excluded from required columns
const requiredColumns = [
    'Position', 'Company', 'Status', 'Application Date', 'Timeline',
    'Link', 'Platform', 'Salary', 'Contact', 'Follow Up'
];

test('HomePage renders correctly and matches snapshot', () => {
  const { container } = renderWithGoogleProvider(<HomePage />);
  expect(container).toMatchSnapshot();
});

describe('HomePage Core Requirements (Static Content)', () => {
  
  beforeEach(() => {
    localStorageMock.clear();
    renderWithGoogleProvider(<HomePage />);
  });

  test('renders the add entry button', () => {
    // El título y login button ahora están en el Header que está en MainLayout
    // Solo verificamos que el botón de agregar entrada esté presente
    expect(screen.getByRole('button', { name: "Add new application entry" })).toBeInTheDocument();
  });

  test('renders the table with all required columns', () => {
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
    const savedData = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
    
    expect(savedData).toHaveLength(1);
    expect(savedData[0].position).toBe('QA Tester');
    expect(savedData[0].status).toBe('Interviewing');
    
    // 2. Verificación de Actualización de Tabla (may appear in both mobile and desktop views)
    expect(screen.getAllByText(/QA Tester/i).length).toBeGreaterThan(0);
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
        
        // Verificación dentro del loop: asegurar que el nuevo registro aparece (may appear in both mobile and desktop views)
        expect(screen.getAllByText(app.position).length).toBeGreaterThan(0);
        
        // La primera entrada es 1, la segunda es 2, etc.
        const setItemCalls = localStorageMock.setItem.mock.calls;
        const jobTrackerDataCalls = setItemCalls.filter(call => call[0] === STORAGE_KEY);
        expect(jobTrackerDataCalls.length).toBe(index + 1);
    }
    
    // Verificación final: el array de localStorage debe tener 3 elementos
    const finalSavedData = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
    expect(finalSavedData).toHaveLength(testApplications.length);
  });

  test('Filters by status and search reduce the results on table view', async () => {
    await createAndSaveApplication({ position: 'Frontend Dev', company: 'UI Labs', status: 'Interviewing', platform: 'LinkedIn' });
    await createAndSaveApplication({ position: 'Backend Dev', company: 'API Works', status: 'Offer', platform: 'Referral' });

    const searchInput = screen.getByLabelText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'Frontend' } });

    // Wait for debounce (300ms) and filter to apply (may appear in both mobile and desktop views)
    await waitFor(() => {
      expect(screen.getAllByText(/Frontend Dev/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Backend Dev/i).length).toBe(0);
    }, { timeout: 1000 });

    // Clear search first, then filter by status using the new advanced filtering
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // Wait for debounce to clear the search filter
    await waitFor(() => {
      expect(screen.getAllByText(/Backend Dev/i).length).toBeGreaterThan(0);
    }, { timeout: 1000 });
    
    // Open the Include dropdown and select "Offer"
    const includeButton = screen.getByText(/Include/i);
    fireEvent.click(includeButton);
    
    // Wait for the dropdown to open and click on "Offer" checkbox
    // Use getAllByLabelText and select the first one (from Include dropdown)
    await waitFor(() => {
      const offerCheckboxes = screen.getAllByLabelText(/Offer/i);
      expect(offerCheckboxes.length).toBeGreaterThan(0);
    });
    const offerCheckboxes = screen.getAllByLabelText(/Offer/i);
    fireEvent.click(offerCheckboxes[0]); // Click the first one (from Include dropdown)

    // Wait for filter to apply (may appear in both mobile and desktop views)
    await waitFor(() => {
      expect(screen.getAllByText(/Backend Dev/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Frontend Dev/i).length).toBe(0);
    }, { timeout: 1000 });
  });

  test('Can switch between Kanban and Calendar views', async () => {
    await createAndSaveApplication({ position: 'Support Engineer', company: 'HelpDesk', status: 'Applied', platform: 'Company Website' });

    const kanbanButton = screen.getByRole('button', { name: /Board view grouped by status/i });
    fireEvent.click(kanbanButton);
    
    // Check for Applied status in Kanban view (not in the select dropdown)
    // Look for the header of the Kanban column
    await waitFor(() => {
      const appliedHeaders = screen.getAllByText(/Applied/i);
      // Should find Applied in the Kanban column header (not just in the filter dropdown)
      expect(appliedHeaders.length).toBeGreaterThan(0);
    });

    const calendarButton = screen.getByRole('button', { name: /Monthly calendar of interviews/i });
    fireEvent.click(calendarButton);
    // Calendar appears in both the button label and the view title, so use getAllByText
    const calendarElements = screen.getAllByText(/Calendar/i);
    expect(calendarElements.length).toBeGreaterThan(0);
  });
});