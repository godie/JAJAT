import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import Header from '../components/Header';


// =========================================================================
// MOCKS SETUP
// =========================================================================

const localStorageStore: Record<string, string> = {};

// Mock for utility functions imported by the Header component
const checkLoginStatus = vi.fn(() => localStorageStore['isLoggedIn'] === 'true');
const setLoginStatus = vi.fn((status: boolean) => {
  if (status) {
    localStorageStore['isLoggedIn'] = 'true';
  } else {
    delete localStorageStore['isLoggedIn'];
  }
});

// Mock the module that provides the utility functions
vi.mock('../utils/localStorage', () => ({
  checkLoginStatus: checkLoginStatus,
  setLoginStatus: setLoginStatus,
  // Ensure other utilities are mocked if used (not strictly needed here but good practice)
  getApplications: vi.fn(() => []),
  saveApplications: vi.fn(),
}));

// Mock the global window.google object for GIS testing
const googleMock = {
  accounts: {
    id: {
      initialize: vi.fn(),
      prompt: vi.fn(),
    },
  },
};

// Mock global alert to prevent test runner interruption
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

// Mock environment variable
process.env.VITE_GOOGLE_CLIENT_ID = 'TEST_CLIENT_ID';

// =========================================================================
// TEST SUITE
// =========================================================================

describe('Header Component', () => {

  beforeEach(() => {
    // Clear mocks and reset state before each test
    vi.clearAllMocks();
    localStorageStore['isLoggedIn'] = 'false'; // Default to logged out
    checkLoginStatus.mockClear();
    setLoginStatus.mockClear();

    // Ensure window.google is initially undefined for initial load test
    (window as any).google = undefined;
    
    // Set a default environment variable
    process.env.VITE_GOOGLE_CLIENT_ID = 'TEST_CLIENT_ID';
  });

  test('should render the application title', () => {
    render(<Header />);
    expect(screen.getByText(/Just Another Job Application Tracker/i)).toBeInTheDocument();
  });

  // --- Initial State Tests ---

  test('should render Login button when initially logged out', () => {
    checkLoginStatus.mockReturnValue(false);
    render(<Header />);
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toHaveTextContent('Login with Google');
    expect(loginButton).toHaveAttribute('aria-label', 'Login with Google');
  });

  test('should render Logout button when initially logged in', () => {
    checkLoginStatus.mockReturnValue(true);
    render(<Header />);
    const logoutButton = screen.getByTestId('login-button');
    expect(logoutButton).toHaveTextContent('Logout');
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
  });

  // --- Login/Logout Logic Tests ---

  test('Logout action should call setLoginStatus(false) and alert', () => {
    checkLoginStatus.mockReturnValue(true);
    render(<Header />);
    
    const logoutButton = screen.getByTestId('login-button');
    fireEvent.click(logoutButton);
    
    expect(setLoginStatus).toHaveBeenCalledWith(false);
    expect(alertMock).toHaveBeenCalledWith('Logged out successfully!');
  });

  test('Login action should call google.accounts.id.prompt() when GIS is loaded', () => {
    checkLoginStatus.mockReturnValue(false);
    (window as any).google = googleMock;
    render(<Header />);
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    
    expect(googleMock.accounts.id.prompt).toHaveBeenCalledTimes(1);
    expect(alertMock).not.toHaveBeenCalled();
  });

  test('Login action should alert when GIS is not loaded', () => {
    checkLoginStatus.mockReturnValue(false);
    render(<Header />); // window.google is undefined
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    
    expect(alertMock).toHaveBeenCalledWith('Google Identity Services not loaded yet. Please try again.');
    expect(googleMock.accounts.id.prompt).not.toHaveBeenCalled();
  });

  // --- GIS Initialization and Callback Tests ---

  test('should initialize GIS if not logged in and window.google is available', () => {
    checkLoginStatus.mockReturnValue(false);
    (window as any).google = googleMock;
    render(<Header />);
    
    expect(googleMock.accounts.id.initialize).toHaveBeenCalledTimes(1);
    expect(googleMock.accounts.id.initialize).toHaveBeenCalledWith({
      client_id: 'TEST_CLIENT_ID',
      callback: window.handleCredentialResponse,
      auto_select: false,
    });
  });

  test('should NOT initialize GIS if already logged in', () => {
    checkLoginStatus.mockReturnValue(true);
    (window as any).google = googleMock;
    render(<Header />);
    
    expect(googleMock.accounts.id.initialize).not.toHaveBeenCalled();
  });
  
  test('handleCredentialResponse should set login status and show success alert', () => {
    checkLoginStatus.mockReturnValue(false);
    (window as any).google = googleMock;
    render(<Header />);
    
    // Simulate the GIS script calling the global handler
    const mockCredentialResponse = { credential: 'mock_jwt_token' } as any;
    
    // Execute the callback function defined in the useEffect
    (window as any).handleCredentialResponse(mockCredentialResponse);

    // Assert state updates and user feedback
    expect(setLoginStatus).toHaveBeenCalledWith(true);
    expect(alertMock).toHaveBeenCalledWith('Successful Login with Google!');
    
    // Assert the UI updates (button text changes to Logout)
    const logoutButton = screen.getByTestId('login-button');
    expect(logoutButton).toHaveTextContent('Logout');
  });
});
