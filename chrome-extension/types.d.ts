// Basic Chrome Extension API types
// For full types, install @types/chrome: npm install --save-dev @types/chrome

declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
    }
    
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }, callback: (tabs: Tab[]) => void): void;
    function sendMessage(tabId: number, message: unknown, callback?: (response: unknown) => void): void;
    function create(createProperties: { url: string }): void;
  }

  namespace runtime {
    interface LastError {
      message?: string;
    }
    
    const lastError: LastError | undefined;
    
    interface MessageEvent {
      addListener(callback: (request: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void): void;
    }
    
    const onMessage: MessageEvent;
    
    interface InstalledEvent {
      addListener(callback: (details: { reason: string }) => void): void;
    }
    
    const onInstalled: InstalledEvent;
  }

  namespace storage {
    interface StorageArea {
      get(keys: string[] | null, callback: (items: { [key: string]: unknown }) => void): void;
      set(items: { [key: string]: unknown }, callback?: () => void): void;
    }
    
    const local: StorageArea;
  }
}

