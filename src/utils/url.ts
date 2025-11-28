// src/utils/url.ts
import DOMPurify from 'dompurify';

/**
 * Validates and sanitizes a URL for safe use in href attributes.
 * Prevents javascript:, data:, vbscript: and other dangerous URL schemes.
 * @param url The URL to validate
 * @returns A safe URL string, or '#' if the URL is invalid or dangerous
 */
export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') {
      return '#';
    }
  
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol.toLowerCase();
  
      // Allow only safe URL schemes
      const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
      if (!allowedSchemes.includes(protocol)) {
        return '#';
      }
  
      return url;
    } catch {
      // If URL parsing fails, check if it's a relative URL (starts with /)
      // Only allow relative URLs that start with /
      if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
      }
      // Return safe default for invalid URLs
      return '#';
    }
  };
  
  /**
   * Recursively sanitizes all string properties of an object.
   * @param obj The object to sanitize.
   * @returns A new object with all string properties sanitized.
   */
  export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
    const sanitizedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          // Sanitize string values
          sanitizedObj[key] = DOMPurify.sanitize(value);
        } else if (Array.isArray(value)) {
          // Recursively sanitize items in arrays
          sanitizedObj[key] = value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return sanitizeObject(item as Record<string, unknown>);
            }
            if (typeof item === 'string') {
              return DOMPurify.sanitize(item);
            }
            return item;
          });
        } else if (typeof value === 'object' && value !== null) {
          // Recursively sanitize nested objects
          sanitizedObj[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
          // Keep non-string, non-object, non-array values as is
          sanitizedObj[key] = value;
        }
      }
    }
    return sanitizedObj as T;
  };