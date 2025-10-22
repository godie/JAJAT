// src/hooks/useKeyboardEscape.ts
import useKeyboardKey from './useKeyboardKey';

/**
 * Wrapper hook for `useKeyboardKey` that listens specifically for the Escape key.
 * @param callback The function to execute when Escape is pressed
 * @param isActive Whether the hook should be active and listening for events
 */
const useKeyboardEscape = (callback: () => void, isActive: boolean = true): void => {
  useKeyboardKey('Escape', callback, isActive);
};

export default useKeyboardEscape;
