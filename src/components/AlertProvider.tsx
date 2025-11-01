// src/components/AlertProvider.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Alert from './Alert';
import type { AlertType } from './Alert';

interface AlertConfig {
  type: AlertType;
  message: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Array<AlertConfig & { id: string }>>([]);

  const addAlert = useCallback((config: AlertConfig) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { ...config, id }]);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback((config: AlertConfig) => {
    addAlert(config);
  }, [addAlert]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addAlert({ type: 'success', message, duration });
  }, [addAlert]);

  const showError = useCallback((message: string, duration?: number) => {
    addAlert({ type: 'error', message, duration });
  }, [addAlert]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addAlert({ type: 'warning', message, duration });
  }, [addAlert]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addAlert({ type: 'info', message, duration });
  }, [addAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Alert container - positioned fixed at top right */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-2 pointer-events-none">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              type={alert.type}
              message={alert.message}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

