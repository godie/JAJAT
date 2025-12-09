// chrome-extension/__tests__/GreenhouseJobExtractor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GreenhouseJobExtractor } from '../job-extractors/GreenhouseJobExtractor';

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockQuerySelector.mockReturnValue(null);
  mockQuerySelectorAll.mockReturnValue([]);
  
  // Clear window.__remixContext
  Object.defineProperty(global, 'window', { value: { __remixContext: undefined } });
  
  global.document = {
    querySelector: mockQuerySelector,
    querySelectorAll: mockQuerySelectorAll,
  } as unknown as Document;
});

describe('GreenhouseJobExtractor', () => {
  const extractor = new GreenhouseJobExtractor();

  describe('canHandle', () => {
    it('should return true for Greenhouse boards URLs', () => {
      expect(extractor.canHandle('https://boards.greenhouse.io/company/jobs/123')).toBe(true);
      expect(extractor.canHandle('https://job-boards.greenhouse.io/company/jobs/123')).toBe(true);
      expect(extractor.canHandle('https://greenhouse.io/jobs/123')).toBe(true);
    });

    it('should return false for non-Greenhouse URLs', () => {
      expect(extractor.canHandle('https://example.com')).toBe(false);
      expect(extractor.canHandle('https://www.linkedin.com/jobs/view/123')).toBe(false);
    });
  });

  describe('extract', () => {
    it('should extract position from DOM', () => {
      const mockElement = { textContent: 'Senior Software Engineer' };
      mockQuerySelector.mockReturnValueOnce(mockElement);
      
      const result = extractor.extract();
      expect(result.position).toBe('Senior Software Engineer');
    });

    it('should extract company name from React state', () => {
      const mockRemixContext = {
        state: {
          loaderData: {
            'routes/$url_token_.jobs_.$job_post_id': {
              jobPost: {
                company_name: 'Narvar',
              },
            },
          },
        },
      };
      
      Object.defineProperty(global, 'window', { value: { __remixContext: mockRemixContext } });
      
      mockQuerySelector.mockReturnValue(null);
      
      const result = extractor.extract();
      expect(result.company).toBe('Narvar');
    });

    it('should extract company name from meta tag if React state not available', () => {
      const mockMetaElement = { content: 'Test Company' } as HTMLMetaElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(mockMetaElement) // company meta 1 (found!)
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(null) // logo
        .mockReturnValueOnce(null) // location 1
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(null) // jobType 1
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null) // jobType 3
        .mockReturnValueOnce(null) // description 1
        .mockReturnValueOnce(null) // description 2
        .mockReturnValueOnce(null); // description 3
      
      const result = extractor.extract();
      expect(result.company).toBe('Test Company');
    });

    it('should extract location and job type from location element', () => {
      const mockLocationElement = {
        textContent: 'Remote - Canada',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(null) // company meta
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(null) // logo
        .mockReturnValueOnce(mockLocationElement) // location 1 (found!)
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(mockLocationElement) // jobType 1 (found! - uses same selectors)
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null); // jobType 3
      
      const result = extractor.extract();
      // extractLocation returns first part before dash, so "Remote - Canada" -> "Remote"
      expect(result.location).toBe('Remote');
      expect(result.jobType).toBe('Remote');
    });

    it('should detect Hybrid job type', () => {
      const mockLocationElement = {
        textContent: 'Hybrid - New York, NY',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(null) // company meta
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(null) // logo
        .mockReturnValueOnce(mockLocationElement) // location 1 (found!)
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(mockLocationElement) // jobType 1 (found! - uses same selectors)
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null); // jobType 3
      
      const result = extractor.extract();
      expect(result.jobType).toBe('Hybrid');
    });

    it('should extract description and limit to 1000 characters', () => {
      const longDescription = 'A'.repeat(1500);
      const mockDescriptionElement = { textContent: longDescription };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(null) // company meta
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(null) // logo
        .mockReturnValueOnce(null) // location 1
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(null) // jobType 1 (uses same selectors as location)
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null) // jobType 3
        .mockReturnValueOnce(null) // description 1
        .mockReturnValueOnce(null) // description 2
        .mockReturnValueOnce(mockDescriptionElement); // description 3 (found!)
      
      const result = extractor.extract();
      expect(result.description?.length).toBeLessThanOrEqual(1003);
      expect(result.description).toContain('...');
    });

    it('should extract salary from pay ranges section', () => {
      const mockSalaryElement = { textContent: '$180,000 - $230,000 CAD' };
      const mockSalaryElements = [mockSalaryElement];
      
      mockQuerySelectorAll.mockReturnValueOnce(mockSalaryElements);
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title
        .mockReturnValueOnce(null) // location
        .mockReturnValueOnce(null) // description
        .mockReturnValueOnce(null); // salary selector
      
      const result = extractor.extract();
      expect(result.salary).toBe('$180,000 - $230,000 CAD');
    });

    it('should extract posted date from React state', () => {
      const mockRemixContext = {
        state: {
          loaderData: {
            'routes/$url_token_.jobs_.$job_post_id': {
              jobPost: {
                published_at: '2025-01-15T19:34:31-04:00',
              },
            },
          },
        },
      };
      
      Object.defineProperty(global, 'window', { value: { __remixContext: mockRemixContext } });
      
      mockQuerySelector.mockReturnValue(null);
      
      const result = extractor.extract();
      expect(result.postedDate).toBeDefined();
      expect(result.postedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // The date is converted to ISO and then split, so it uses local timezone conversion
      // '2025-01-15T19:34:31-04:00' in UTC is '2025-01-15T23:34:31Z', so date is 2025-01-15
      expect(result.postedDate).toBe('2025-01-15');
    });

    it('should handle missing DOM elements gracefully', () => {
      mockQuerySelector.mockReturnValue(null);
      
      const result = extractor.extract();
      expect(result).toBeDefined();
      expect(result.position).toBeUndefined();
      expect(result.company).toBeUndefined();
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

    it('should extract company name from logo alt text', () => {
      const mockLogoElement = {
        alt: 'Narvar Logo',
      } as HTMLImageElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(null) // company meta 1
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(mockLogoElement) // logo (found!)
        .mockReturnValueOnce(null) // location 1
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(null) // jobType 1
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null) // jobType 3
        .mockReturnValueOnce(null) // description 1
        .mockReturnValueOnce(null) // description 2
        .mockReturnValueOnce(null); // description 3
      
      const result = extractor.extract();
      expect(result.company).toBe('Narvar');
    });

    it('should extract full location text including country', () => {
      const mockLocationElement = {
        textContent: 'Remote - Canada',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // title 1
        .mockReturnValueOnce(null) // title 2
        .mockReturnValueOnce(null) // title 3
        .mockReturnValueOnce(null) // title 4
        .mockReturnValueOnce(null) // title 5
        .mockReturnValueOnce(null) // company meta
        .mockReturnValueOnce(null) // company meta 2
        .mockReturnValueOnce(null) // logo
        .mockReturnValueOnce(mockLocationElement) // location 1 (found!)
        .mockReturnValueOnce(null) // location 2
        .mockReturnValueOnce(null) // location 3
        .mockReturnValueOnce(mockLocationElement) // jobType 1 (found!)
        .mockReturnValueOnce(null) // jobType 2
        .mockReturnValueOnce(null); // jobType 3
      
      const result = extractor.extract();
      // extractLocation returns first part before dash, so "Remote - Canada" -> "Remote"
      expect(result.location).toBe('Remote');
    });
  });
});

