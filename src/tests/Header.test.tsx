import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import Header from '../components/Header';
import * as localStorageUtils from '../utils/localStorage';


// =========================================================================
// MOCKS SETUP
// =========================================================================

const localStorageStore: Record<string, string> = {};

// Mock the API module
vi.mock('../utils/api', () => ({
  setAuthCookie: vi.fn(() => Promise.resolve({ success: true })),
  clearAuthCookie: vi.fn(() => Promise.resolve({ success: true })),
  getAuthCookie: vi.fn(),
}));

// Mock the module that provides the utility functions
vi.mock('../utils/localStorage', () => {
  const checkLoginStatus = vi.fn(() => {
    return localStorageStore['isLoggedIn'] === 'true';
  });
  
  const setLoginStatus = vi.fn((status: boolean) => {
    if (status) {
      localStorageStore['isLoggedIn'] = 'true';
    } else {
      delete localStorageStore['isLoggedIn'];
    }
  });
  
  return {
    checkLoginStatus,
    setLoginStatus,
    getApplications: vi.fn(() => []),
    saveApplications: vi.fn(),
  };
});

// Mock the @react-oauth/google hook
const mockGoogleLogin = vi.fn();
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: () => mockGoogleLogin,
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock global alert to prevent test runner interruption
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

// =========================================================================
// TEST SUITE
// =========================================================================

describe('Header Component', () => {

  beforeEach(() => {
    // Clear mocks and reset state before each test
    vi.clearAllMocks();
    localStorageStore['isLoggedIn'] = 'false'; // Default to logged out
    (localStorageUtils.checkLoginStatus as any).mockClear();
    (localStorageUtils.setLoginStatus as any).mockClear();
    mockGoogleLogin.mockClear();
  });

  test('should render the application title', () => {
    render(<Header />);
    expect(screen.getByText(/Just Another Job Application Tracker/i)).toBeInTheDocument();
  });

  // --- Initial State Tests ---

  test('should render Login button when initially logged out', () => {
    (localStorageUtils.checkLoginStatus as any).mockReturnValue(false);
    render(<Header />);
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toHaveTextContent('Login with Google');
    expect(loginButton).toHaveAttribute('aria-label', 'Login with Google');
  });

  test('should render Logout button when initially logged in', () => {
    (localStorageUtils.checkLoginStatus as any).mockReturnValue(true);
    render(<Header />);
    const logoutButton = screen.getByTestId('login-button');
    expect(logoutButton).toHaveTextContent('Logout');
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
  });

  // --- Login/Logout Logic Tests ---

  test('Logout action should call setLoginStatus(false) and alert', async () => {
    (localStorageUtils.checkLoginStatus as any).mockReturnValue(true);
    render(<Header />);
    
    const logoutButton = screen.getByTestId('login-button');
    fireEvent.click(logoutButton);
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(localStorageUtils.setLoginStatus).toHaveBeenCalledWith(false);
      expect(alertMock).toHaveBeenCalledWith('Logged out successfully!');
    });
  });

  test('Login action should call googleLogin function', () => {
    (localStorageUtils.checkLoginStatus as any).mockReturnValue(false);
    render(<Header />);
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    
    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
