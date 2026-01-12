// chrome-extension/__tests__/LeverJobExtractor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeverJobExtractor } from '../job-extractors/LeverJobExtractor';

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockQuerySelector.mockReturnValue(null);
  mockQuerySelectorAll.mockReturnValue([]);
  
  global.document = {
    querySelector: mockQuerySelector,
    querySelectorAll: mockQuerySelectorAll,
    createElement: vi.fn(() => ({
      textContent: '',
      innerHTML: '',
    })),
  } as unknown as Document;
});

describe('LeverJobExtractor', () => {
  const extractor = new LeverJobExtractor();

  describe('canHandle', () => {
    it('should return true for Lever.co job URLs', () => {
      expect(extractor.canHandle('https://jobs.lever.co/company/job/123')).toBe(true);
      expect(extractor.canHandle('https://company.lever.co/jobs/123')).toBe(true);
      expect(extractor.canHandle('https://lever.co/company/jobs/123')).toBe(true);
    });

    it('should return false for non-Lever URLs', () => {
      expect(extractor.canHandle('https://example.com')).toBe(false);
      expect(extractor.canHandle('https://www.linkedin.com/jobs/view/123')).toBe(false);
      expect(extractor.canHandle('https://boards.greenhouse.io/company/jobs/123')).toBe(false);
    });
  });

  describe('extractJobTitle', () => {
    it('should extract title from JSON-LD JobPosting', () => {
      const jsonLdContent = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: 'Senior Software Engineer',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractJobTitle();
      expect(result).toBe('Senior Software Engineer');
    });

    it('should extract title from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'Organization',
          name: 'Company',
        },
        {
          '@type': 'JobPosting',
          title: 'Full Stack Developer',
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractJobTitle();
      expect(result).toBe('Full Stack Developer');
    });

    it('should extract title from og:title meta tag', () => {
      const mockMetaElement = {
        content: 'Software Engineer - Company Name',
      } as HTMLMetaElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockMetaElement); // og:title
      
      const result = extractor.extractJobTitle();
      expect(result).toBe('Software Engineer');
    });

    it('should extract title from page title tag', () => {
      const mockTitleElement = {
        textContent: 'Senior Engineer - Company',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(null) // og:title
        .mockReturnValueOnce(mockTitleElement); // title tag
      
      const result = extractor.extractJobTitle();
      expect(result).toBe('Senior Engineer');
    });

    it('should extract title from DOM selectors', () => {
      const mockH1Element = {
        textContent: 'Backend Engineer',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(null) // og:title
        .mockReturnValueOnce(null) // title tag
        .mockReturnValueOnce(null) // h1[class*="posting-title"]
        .mockReturnValueOnce(null) // h1[class*="job-title"]
        .mockReturnValueOnce(null) // .posting-header h1
        .mockReturnValueOnce(null) // .posting-header-title h1
        .mockReturnValueOnce(mockH1Element); // h1
      
      const result = extractor.extractJobTitle();
      expect(result).toBe('Backend Engineer');
    });
  });

  describe('extractCompanyName', () => {
    it('should extract company from JSON-LD hiringOrganization', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        hiringOrganization: {
          name: 'Tech Company',
        },
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractCompanyName();
      expect(result).toBe('Tech Company');
    });

    it('should extract company from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'JobPosting',
          hiringOrganization: {
            name: 'Test Company',
          },
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractCompanyName();
      expect(result).toBe('Test Company');
    });

    it('should extract company from og:site_name meta tag', () => {
      const mockMetaElement = {
        content: 'Company Name',
      } as HTMLMetaElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockMetaElement); // og:site_name
      
      const result = extractor.extractCompanyName();
      expect(result).toBe('Company Name');
    });

    it('should extract company from og:title format', () => {
      const mockMetaElement = {
        content: 'Job Title - Company Name',
      } as HTMLMetaElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(null) // og:site_name
        .mockReturnValueOnce(mockMetaElement); // og:title
      
      const result = extractor.extractCompanyName();
      expect(result).toBe('Company Name');
    });
  });

  describe('extractLocation', () => {
    it('should extract location from JSON-LD address', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        jobLocation: {
          address: {
            addressLocality: 'San Francisco',
            addressRegion: 'CA',
            addressCountry: 'USA',
          },
        },
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractLocation();
      expect(result).toBe('San Francisco, CA, USA');
    });

    it('should extract location from JSON-LD string format', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        jobLocation: 'Toronto, Ontario',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractLocation();
      expect(result).toBe('Toronto, Ontario');
    });

    it('should extract location from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'JobPosting',
          jobLocation: {
            address: {
              addressLocality: 'New York',
              addressRegion: 'NY',
            },
          },
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractLocation();
      expect(result).toBe('New York, NY');
    });

    it('should extract location from DOM selectors', () => {
      const mockLocationElement = {
        textContent: 'Remote, USA',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockLocationElement); // location selector
      
      const result = extractor.extractLocation();
      expect(result).toBe('Remote');
    });
  });

  describe('extractJobType', () => {
    it('should detect Remote from JSON-LD jobLocationType', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        jobLocationType: 'TELECOMMUTE',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractJobType();
      expect(result).toBe('Remote');
    });

    it('should detect Remote from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'JobPosting',
          jobLocationType: 'TELECOMMUTE',
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractJobType();
      expect(result).toBe('Remote');
    });

    it('should detect Remote from DOM location text', () => {
      const mockLocationElement = {
        textContent: 'Remote, USA',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockLocationElement); // location selector
      
      const result = extractor.extractJobType();
      expect(result).toBe('Remote');
    });

    it('should detect Hybrid from DOM location text', () => {
      const mockLocationElement = {
        textContent: 'Hybrid, San Francisco',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockLocationElement); // location selector
      
      const result = extractor.extractJobType();
      expect(result).toBe('Hybrid');
    });

    it('should detect On-site from DOM location text', () => {
      const mockLocationElement = {
        textContent: 'On-site, New York',
      };
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockLocationElement); // location selector
      
      const result = extractor.extractJobType();
      expect(result).toBe('On-site');
    });
  });

  describe('extractJobDescription', () => {
    it('should extract description from JSON-LD', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        description: '<p>This is a job description. This is a comprehensive job description that includes all the necessary details about the position, requirements, and responsibilities. It needs to be at least 100 characters long to be extracted by the extractor.</p>',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      (global.document.createElement as unknown) = vi.fn(() => {
        const div: { _innerHTML: string; _textContent: string } = {
          _innerHTML: '',
          _textContent: '',
        };
        Object.defineProperty(div, 'innerHTML', {
          set(value: string) {
            div._innerHTML = value;
            div._textContent = value.replace(/<[^>]*>/g, '').trim();
          },
          get() {
            return div._innerHTML || '';
          },
        });
        Object.defineProperty(div, 'textContent', {
          get() {
            return div._textContent || '';
          },
        });
        return div;
      });
      
      const result = extractor.extractJobDescription();
      expect(result.length).toBeGreaterThan(100);
      expect(result).toContain('This is a job description');
    });

    it('should extract description from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'JobPosting',
          description: '<p>Job description for full stack position. This is a comprehensive job description that includes all the necessary details about the position, requirements, and responsibilities. It needs to be at least 100 characters long to be extracted by the extractor.</p>',
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      (global.document.createElement as unknown) = vi.fn(() => {
        const div: { _innerHTML: string; _textContent: string } = {
          _innerHTML: '',
          _textContent: '',
        };
        Object.defineProperty(div, 'innerHTML', {
          set(value: string) {
            div._innerHTML = value;
            div._textContent = value.replace(/<[^>]*>/g, '').trim();
          },
          get() {
            return div._innerHTML || '';
          },
        });
        Object.defineProperty(div, 'textContent', {
          get() {
            return div._textContent || '';
          },
        });
        return div;
      });
      
      const result = extractor.extractJobDescription();
      expect(result.length).toBeGreaterThan(100);
      expect(result).toContain('Job description for full stack position');
    });

    it('should extract description from og:description meta tag', () => {
      const mockMetaElement = {
        content: 'A'.repeat(500),
      } as HTMLMetaElement;
      
      mockQuerySelector
        .mockReturnValueOnce(null) // JSON-LD script
        .mockReturnValueOnce(mockMetaElement); // og:description
      
      const result = extractor.extractJobDescription();
      expect(result).toBe('A'.repeat(500));
    });

    it('should limit description to 1000 characters', () => {
      const longDescription = '<p>' + 'A'.repeat(2000) + '</p>';
      const jsonLdContent = {
        '@type': 'JobPosting',
        description: longDescription,
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      (global.document.createElement as unknown) = vi.fn(() => {
        const div: { _innerHTML: string; _textContent: string } = {
          _innerHTML: '',
          _textContent: '',
        };
        Object.defineProperty(div, 'innerHTML', {
          set(value: string) {
            div._innerHTML = value;
            div._textContent = value.replace(/<[^>]*>/g, '').trim();
          },
          get() {
            return div._innerHTML || '';
          },
        });
        Object.defineProperty(div, 'textContent', {
          get() {
            return div._textContent || '';
          },
        });
        return div;
      });
      
      const result = extractor.extractJobDescription();
      expect(result.length).toBe(1003); // 1000 + '...'
      expect(result).toContain('...');
    });
  });

  describe('extractSalary', () => {
    it('should extract salary from JSON-LD baseSalary', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        baseSalary: {
          currency: 'USD',
          value: {
            minValue: 120000,
            maxValue: 180000,
            unitText: 'YEAR',
          },
        },
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractSalary();
      expect(result).toContain('USD');
      expect(result).toContain('120,000');
      expect(result).toContain('180,000');
    });

    it('should extract salary from JSON-LD array format', () => {
      const jsonLdContent = [
        {
          '@type': 'JobPosting',
          baseSalary: {
            currency: 'CAD',
            value: {
              minValue: 100000,
              maxValue: 150000,
              unitText: 'YEAR',
            },
          },
        },
      ];
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractSalary();
      expect(result).toContain('CAD');
      expect(result).toContain('100,000');
      expect(result).toContain('150,000');
    });

    it('should handle salary with only minValue', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        baseSalary: {
          currency: 'USD',
          value: {
            minValue: 100000,
            unitText: 'YEAR',
          },
        },
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      mockQuerySelector.mockReturnValueOnce(mockScriptElement);
      
      const result = extractor.extractSalary();
      expect(result).toContain('USD');
      expect(result).toContain('100,000');
    });
  });

  describe('extract', () => {
    it('should extract all fields from JSON-LD', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        title: 'Senior Software Engineer',
        hiringOrganization: {
          name: 'Tech Company',
        },
        jobLocation: {
          address: {
            addressLocality: 'San Francisco',
            addressRegion: 'CA',
            addressCountry: 'USA',
          },
        },
        jobLocationType: 'TELECOMMUTE',
        description: '<p>Job description text that is long enough to be extracted. This is a comprehensive job description that includes all the necessary details about the position, requirements, and responsibilities. It needs to be at least 100 characters long to be extracted by the extractor.</p>',
        baseSalary: {
          currency: 'USD',
          value: {
            minValue: 150000,
            maxValue: 200000,
            unitText: 'YEAR',
          },
        },
        datePosted: '2025-01-15',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      // Mock multiple calls to JSON-LD (one for each extraction method)
      let jsonLdCallCount = 0;
      mockQuerySelector.mockImplementation((selector: string) => {
        if (selector === 'script[type="application/ld+json"]') {
          jsonLdCallCount++;
          // Return JSON-LD for each extraction method
          if (jsonLdCallCount <= 7) { // title, company, location, jobType, description, salary, date
            return mockScriptElement as unknown as HTMLScriptElement;
          }
          return null;
        }
        return null;
      });
      
      (global.document.createElement as unknown) = vi.fn(() => {
        const div: { _innerHTML: string; _textContent: string } = {
          _innerHTML: '',
          _textContent: '',
        };
        Object.defineProperty(div, 'innerHTML', {
          set(value: string) {
            div._innerHTML = value;
            div._textContent = value.replace(/<[^>]*>/g, '').trim();
          },
          get() {
            return div._innerHTML || '';
          },
        });
        Object.defineProperty(div, 'textContent', {
          get() {
            return div._textContent || '';
          },
        });
        return div;
      });
      
      const result = extractor.extract();
      
      expect(result.position).toBe('Senior Software Engineer');
      expect(result.company).toBe('Tech Company');
      expect(result.location).toBe('San Francisco, CA, USA');
      expect(result.jobType).toBe('Remote');
      expect(result.description).toBeDefined();
      expect(result.description?.length).toBeGreaterThan(100);
      expect(result.salary).toContain('USD');
      expect(result.postedDate).toBe('2025-01-15');
    });

    it('should extract posted date from JSON-LD', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        datePosted: '2025-01-20',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      // Mock to return JSON-LD always when requested
      mockQuerySelector.mockImplementation((selector: string) => {
        if (selector === 'script[type="application/ld+json"]') {
          return mockScriptElement as unknown as HTMLScriptElement;
        }
        return null;
      });
      
      const result = extractor.extract();
      expect(result.postedDate).toBe('2025-01-20');
    });

    it('should handle missing JSON-LD gracefully', () => {
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

    it('should handle JSON-LD parse errors gracefully', () => {
      const mockScriptElement = {
        textContent: 'invalid json {',
      };
      
      mockQuerySelector.mockReturnValue(mockScriptElement);
      
      const result = extractor.extract();
      expect(result).toBeDefined();
      // Should not throw, should continue with other extraction methods
    });

    it('should handle date parsing errors gracefully', () => {
      const jsonLdContent = {
        '@type': 'JobPosting',
        datePosted: 'invalid-date',
      };
      
      const mockScriptElement = {
        textContent: JSON.stringify(jsonLdContent),
      };
      
      // Mock calls for date extraction
      let jsonLdCallCount = 0;
      mockQuerySelector.mockImplementation((selector: string) => {
        if (selector === 'script[type="application/ld+json"]') {
          jsonLdCallCount++;
          if (jsonLdCallCount === 7) {
            return mockScriptElement as unknown as HTMLScriptElement;
          }
          return null;
        }
        return null;
      });
      
      const result = extractor.extract();
      expect(result.postedDate).toBeUndefined();
    });
  });
});
