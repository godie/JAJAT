import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, beforeEach, vi } from 'vitest';
import Header from '../components/Header';
import { AlertProvider } from '../components/AlertProvider';
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

// Helper function to render with AlertProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertProvider>{ui}</AlertProvider>);
};

// Mock function for sidebar toggle
const mockToggleSidebar = vi.fn();

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
    getOpportunities: vi.fn(() => []),
  };
});

// Mock the @react-oauth/google hook
const mockGoogleLogin = vi.fn();
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: () => mockGoogleLogin,
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// =========================================================================
// TEST SUITE
// =========================================================================

describe('Header Component', () => {

  beforeEach(() => {
    // Clear mocks and reset state before each test
    vi.clearAllMocks();
    Object.keys(localStorageStore).forEach(key => delete localStorageStore[key]);
    localStorageStore['isLoggedIn'] = 'false'; // Default to logged out
    mockGoogleLogin.mockClear();
    mockToggleSidebar.mockClear();
    // Reset theme in localStorage
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  test('should render the application title', () => {
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    expect(screen.getByText(/Just Another Job Application Tracker/i)).toBeInTheDocument();
  });

  test('should render sidebar toggle button', () => {
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    expect(sidebarToggle).toBeInTheDocument();
    expect(sidebarToggle).toHaveAttribute('aria-label', 'Toggle sidebar');
  });

  test('sidebar toggle button should call onToggleSidebar when clicked', () => {
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const sidebarToggle = screen.getByTestId('sidebar-toggle');
    fireEvent.click(sidebarToggle);
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  test('should render theme toggle button', () => {
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
  });

  test('theme toggle should change theme when clicked', async () => {
    localStorage.setItem('theme', 'light');
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const themeToggle = screen.getByTestId('theme-toggle');
    
    fireEvent.click(themeToggle);
    
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  // --- Initial State Tests ---

  test('should render Login button when initially logged out', () => {
    localStorageStore['isLoggedIn'] = 'false';
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toHaveTextContent('Login with Google');
    expect(loginButton).toHaveAttribute('aria-label', 'Login with Google');
  });

  test('should render Logout button when initially logged in', () => {
    localStorageStore['isLoggedIn'] = 'true';
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    const logoutButton = screen.getByTestId('login-button');
    expect(logoutButton).toHaveTextContent('Logout');
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
  });

  // --- Login/Logout Logic Tests ---

  test('Logout action should call setLoginStatus(false)', async () => {
    localStorageStore['isLoggedIn'] = 'true';
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    
    const logoutButton = screen.getByTestId('login-button');
    fireEvent.click(logoutButton);
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(localStorageUtils.setLoginStatus).toHaveBeenCalledWith(false);
    });
  });

  test('Login action should call googleLogin function', () => {
    localStorageStore['isLoggedIn'] = 'false';
    renderWithProviders(<Header onToggleSidebar={mockToggleSidebar} />);
    
    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    
    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
