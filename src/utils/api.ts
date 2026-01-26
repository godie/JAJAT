// src/utils/api.ts

/**
 * API utility functions for backend communication (Laravel API).
 * Handles secure cookie operations: set, get, clear.
 * Use VITE_API_BASE_URL (e.g. http://localhost:8080/api) when backend is on another origin.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Set authentication cookie in backend (Laravel POST /api/auth/cookie).
 * @param accessToken - Google OAuth access token
 * @returns Promise with response data
 */
export const setAuthCookie = async (accessToken: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/cookie`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set auth cookie: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    throw error;
  }
};

/**
 * Clear authentication cookie (logout). Laravel DELETE /api/auth/cookie.
 * @returns Promise with response data
 */
export const clearAuthCookie = async (): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/cookie`, {
      ...defaultFetchOptions,
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear auth cookie: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
    throw error;
  }
};

/**
 * Get authentication cookie from backend (Laravel GET /api/auth/cookie).
 * Requires credentials so the HTTP-only cookie is sent.
 * @returns Promise with access token when logged in
 */
export const getAuthCookie = async (): Promise<{
  success: boolean;
  access_token?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/cookie`, {
      ...defaultFetchOptions,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get auth cookie: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting auth cookie:', error);
    throw error;
  }
};
