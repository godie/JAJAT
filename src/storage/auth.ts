// src/storage/auth.ts

/**
 * Simula la verificación de login.
 * En un proyecto real, esto verificaría un token JWT o una sesión.
 */
export const checkLoginStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Simula el login/logout (se usará como placeholder).
 */
export const setLoginStatus = (status: boolean): void => {
  if (status) {
    localStorage.setItem('isLoggedIn', 'true');
  } else {
    localStorage.removeItem('isLoggedIn');
  }
};

