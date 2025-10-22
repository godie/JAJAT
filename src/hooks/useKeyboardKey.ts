// src/hooks/useKeyboardKey.ts
import { useEffect } from 'react';

/**
 * Custom hook to execute a callback when a specific key is pressed.
 * @param key The key to listen for (e.g., 'Escape', 'Enter', ' ')
 * @param callback The function to execute when the key is pressed
 * @param isActive Whether the hook should be active and listening for events
 */
const useKeyboardKey = (
  key: string,
  callback: () => void,
  isActive: boolean = true
): void => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, isActive]);
};

export default useKeyboardKey;
