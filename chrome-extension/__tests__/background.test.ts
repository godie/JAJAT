// chrome-extension/__tests__/background.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chrome } from '../__mocks__/chrome';

// Mock chrome globally BEFORE importing background
 
(global as any).chrome = chrome;

// Now import after chrome is mocked
import '../background';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Background Script - Installation Listener', () => {
  it('should log message on install', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Simulate installation
    if ((global as any).chromeInstalledListener) {
      (global as any).chromeInstalledListener({ reason: 'install' });
      expect(consoleLogSpy).toHaveBeenCalledWith('Job Application Tracker extension installed');
    }
    
    consoleLogSpy.mockRestore();
  });
  
  it('should not log on update', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    if ((global as any).chromeInstalledListener) {
      (global as any).chromeInstalledListener({ reason: 'update' });
      expect(consoleLogSpy).not.toHaveBeenCalled();
    }
    
    consoleLogSpy.mockRestore();
  });
});

describe('Background Script - Message Handler', () => {
  it('should handle syncOpportunities action', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
    ];
    
    // Mock chrome.storage.local.get
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({ jobOpportunities: mockOpportunities });
      }
    );
    
    // Mock chrome.tabs.query
    const mockTabs = [
      { id: 1, url: 'http://localhost:5173' },
      { id: 2, url: 'https://example.com' },
    ];
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback(mockTabs);
      }
    );
    
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    if ((global as any).chromeMessageListener) {
      const result = (global as any).chromeMessageListener(request, {}, sendResponse);
      
      expect(result).toBe(true);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        ['jobOpportunities'],
        expect.any(Function)
      );
      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    }
  });
  
  it('should send messages to matching tabs', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
    ];
    
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({ jobOpportunities: mockOpportunities });
      }
    );
    
    const mockTabs = [
      { id: 1, url: 'http://localhost:5173' },
      { id: 2, url: 'http://127.0.0.1:5173' },
      { id: 3, url: 'https://example.com' },
    ];
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback(mockTabs);
      }
    );
    
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    if ((global as any).chromeMessageListener) {
      (global as any).chromeMessageListener(request, {}, sendResponse);
      
      // Should send message to tabs 1 and 2 (localhost and 127.0.0.1)
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        {
          action: 'syncOpportunities',
          data: mockOpportunities,
        }
      );
      
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        2,
        {
          action: 'syncOpportunities',
          data: mockOpportunities,
        }
      );
      
      // Should not send to tab 3 (example.com)
      expect(chrome.tabs.sendMessage).not.toHaveBeenCalledWith(3, expect.anything());
    }
  });
  
  it('should handle empty opportunities array', () => {
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({ jobOpportunities: [] });
      }
    );
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback([]);
      }
    );
    
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    if ((global as any).chromeMessageListener) {
      (global as any).chromeMessageListener(request, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
      expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
    }
  });
  
  it('should handle missing jobOpportunities in storage', () => {
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({});
      }
    );
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback([]);
      }
    );
    
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    if ((global as any).chromeMessageListener) {
      (global as any).chromeMessageListener(request, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    }
  });
  
  it('should handle sendMessage errors gracefully', () => {
    const mockOpportunities = [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'Google',
        link: 'https://linkedin.com/jobs/view/123',
        capturedDate: new Date().toISOString(),
      },
    ];
    
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({ jobOpportunities: mockOpportunities });
      }
    );
    
    const mockTabs = [
      { id: 1, url: 'http://localhost:5173' },
    ];
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback(mockTabs);
      }
    );
    
    // Mock sendMessage to reject
    (chrome.tabs.sendMessage as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Content script not available')
    );
    
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    if ((global as any).chromeMessageListener) {
      // Should not throw
      expect(() => {
        (global as any).chromeMessageListener(request, {}, sendResponse);
      }).not.toThrow();
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    }
  });
  
  it('should return true to keep message channel open', () => {
    const request = { action: 'syncOpportunities' };
    const sendResponse = vi.fn();
    
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({ jobOpportunities: [] });
      }
    );
    
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockImplementation(
      (queryInfo: unknown, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
        callback([]);
      }
    );
    
    if ((global as any).chromeMessageListener) {
      const result = (global as any).chromeMessageListener(request, {}, sendResponse);
      expect(result).toBe(true);
    }
  });
});

