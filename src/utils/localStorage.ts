// src/utils/localStorage.ts
// Legacy barrel file for backward compatibility
// All exports are now organized in separate modules:
// - Types: src/types/
// - Storage: src/storage/
// - Utils: src/utils/id.ts, src/utils/date.ts, src/utils/constants.ts

// Re-export types
export * from '../types';

// Re-export storage functions
export * from '../storage';

// Re-export utilities
export { generateId } from './id';
export { formatDate } from './date';
export { sanitizeUrl, sanitizeObject } from './url';
export { DEFAULT_FIELDS, DEFAULT_PREFERENCES, STORAGE_KEY } from './constants';
