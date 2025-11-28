// src/utils/id.ts

/**
 * Helper function to generate unique IDs
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

