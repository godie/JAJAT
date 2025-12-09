// chrome-extension/__tests__/LinkedInJobExtractor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LinkedInJobExtractor } from '../job-extractors/LinkedInJobExtractor';

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockQuerySelector.mockReturnValue(null);
  mockQuerySelectorAll.mockReturnValue([]);
  
  global.document = {
    querySelector: mockQuerySelector,
    querySelectorAll: mockQuerySelectorAll,
  } as unknown as Document;
});

describe('LinkedInJobExtractor', () => {
  const extractor = new LinkedInJobExtractor();

  describe('canHandle', () => {
    it('should return true for LinkedIn job view URLs', () => {
      expect(extractor.canHandle('https://www.linkedin.com/jobs/view/123')).toBe(true);
      expect(extractor.canHandle('https://www.linkedin.com/jobs/collections/123')).toBe(true);
    });

    it('should return false for non-LinkedIn URLs', () => {
      expect(extractor.canHandle('https://example.com')).toBe(false);
      expect(extractor.canHandle('https://greenhouse.io/jobs/123')).toBe(false);
    });
  });

  describe('extract', () => {
    it('should extract position from DOM', () => {
      const mockElement = { textContent: 'Software Engineer' };
      mockQuerySelector.mockReturnValueOnce(mockElement);
      
      const result = extractor.extract();
      expect(result.position).toBe('Software Engineer');
    });

    it('should extract company name from DOM', () => {
      const mockCompanyElement = { textContent: 'Google' };
      
      // Mock position selectors (4) to return null, then company selector to return element
      mockQuerySelector
        .mockReturnValueOnce(null) // position 1
        .mockReturnValueOnce(null) // position 2
        .mockReturnValueOnce(null) // position 3
        .mockReturnValueOnce(null) // position 4
        .mockReturnValueOnce(mockCompanyElement); // company 1 (found!)
      
      const result = extractor.extract();
      expect(result.company).toBe('Google');
    });

    it('should extract location and job type', () => {
      const mockLocationElement = {
        textContent: 'San Francisco, CA · Remote · Posted 2 days ago',
      };
      
      // Mock position (4), company (4), location (4), jobType (4)
      mockQuerySelector
        .mockReturnValueOnce(null) // position 1
        .mockReturnValueOnce(null) // position 2
        .mockReturnValueOnce(null) // position 3
        .mockReturnValueOnce(null) // position 4
        .mockReturnValueOnce(null) // company 1
        .mockReturnValueOnce(null) // company 2
        .mockReturnValueOnce(null) // company 3
        .mockReturnValueOnce(null) // company 4
        .mockReturnValueOnce(null) // location 1
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(mockLocationElement) // location 4 (found!)
        .mockReturnValueOnce(null) // jobType 1
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null) // jobType 3
        .mockReturnValueOnce(mockLocationElement); // jobType 4 (found!)
      
      const result = extractor.extract();
      expect(result.location).toBe('San Francisco, CA');
      expect(result.jobType).toBe('Remote');
    });

    it('should extract description and limit to 1000 characters', () => {
      const longDescription = 'A'.repeat(1500);
      const mockDescriptionElement = { textContent: longDescription };
      
      // Mock all previous selectors: position (4), company (4), location (4), jobType (4), description (4)
      mockQuerySelector
        .mockReturnValueOnce(null) // position 1
        .mockReturnValueOnce(null) // position 2
        .mockReturnValueOnce(null) // position 3
        .mockReturnValueOnce(null) // position 4
        .mockReturnValueOnce(null) // company 1
        .mockReturnValueOnce(null) // company 2
        .mockReturnValueOnce(null) // company 3
        .mockReturnValueOnce(null) // company 4
        .mockReturnValueOnce(null) // location 1
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(null) // location 4
        .mockReturnValueOnce(null) // jobType 1
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null) // jobType 3
        .mockReturnValueOnce(null) // jobType 4
        .mockReturnValueOnce(null) // description 1
        .mockReturnValueOnce(null) // description 2
        .mockReturnValueOnce(null) // description 3
        .mockReturnValueOnce(mockDescriptionElement); // description 4 (found!)
      
      const result = extractor.extract();
      expect(result.description?.length).toBeLessThanOrEqual(1003);
      expect(result.description).toContain('...');
    });

    it('should extract salary when available', () => {
      const mockSalaryElement = { textContent: '$120,000 - $150,000' };
      const mockSalaryElements = [mockSalaryElement];
      
      mockQuerySelectorAll.mockReturnValueOnce(mockSalaryElements);
      
      // Mock all previous selectors
      for (let i = 0; i < 20; i++) {
        mockQuerySelector.mockReturnValueOnce(null);
      }
      
      const result = extractor.extract();
      expect(result.salary).toBe('$120,000 - $150,000');
    });

    it('should extract posted date from "Posted X days ago" format', () => {
      // The location/jobType/date selectors all use the same element
      // This element contains: "Location · Job Type · Posted X days ago"
      const mockPrimaryDescriptionElement = {
        textContent: 'San Francisco, CA · Remote · Posted 5 days ago',
      };
      
      // Use mockImplementation to return elements based on selector
      mockQuerySelector.mockImplementation((selector: string) => {
        // Location, jobType, and date all use these same selectors
        if (selector === '.job-details-jobs-unified-top-card__primary-description-without-tagline' ||
            selector === '.jobs-details-top-card__primary-description' ||
            selector === '.jobs-details-top-card__primary-description-without-tagline' ||
            selector === '.job-details-jobs-unified-top-card__primary-description') {
          return mockPrimaryDescriptionElement as unknown as HTMLElement;
        }
        return null;
      });
      
      const result = extractor.extract();
      expect(result.postedDate).toBeDefined();
      expect(result.postedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle missing DOM elements gracefully', () => {
      // Reset mock to ensure clean state
      mockQuerySelector.mockReset();
      mockQuerySelector.mockReturnValue(null);
      
      const result = extractor.extract();
      expect(result).toBeDefined();
      expect(result.position).toBeUndefined();
      expect(result.company).toBeUndefined();
      expect(result.postedDate).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
      mockQuerySelector.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = extractor.extract();
      expect(result).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});

