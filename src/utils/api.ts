// src/utils/api.ts

/**
 * API utility functions for backend communication
 * These functions handle secure cookie operations through PHP endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Set authentication cookie in backend
 * @param accessToken - Google OAuth access token
 * @returns Promise with response data
 */
export const setAuthCookie = async (accessToken: string): Promise<{success: boolean}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/set-auth-cookie.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
 * Clear authentication cookie (logout)
 * @returns Promise with response data
 */
export const clearAuthCookie = async (): Promise<{success: boolean}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-auth-cookie.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
 * Get authentication cookie from backend
 * Note: This is typically called from server-side code only
 * JavaScript cannot read HTTP-only cookies
 * @returns Promise with access token
 */
export const getAuthCookie = async (): Promise<{success: boolean, access_token?: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-auth-cookie.php`, {
      method: 'GET',
      credentials: 'include', // Important: include cookies in request
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
