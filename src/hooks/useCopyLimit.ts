import { useState, useEffect } from 'react';

const COPY_COUNT_KEY = 'ruangai_copy_count';
const MAX_FREE_COPIES = 3;

export const useCopyLimit = (isLoggedIn: boolean) => {
  const [copyCount, setCopyCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Load copy count from localStorage on mount
    if (!isLoggedIn) {
      const stored = localStorage.getItem(COPY_COUNT_KEY);
      if (stored) {
        setCopyCount(parseInt(stored, 10));
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Reset copy count when user logs in
    if (isLoggedIn) {
      localStorage.removeItem(COPY_COUNT_KEY);
      setCopyCount(0);
    }
  }, [isLoggedIn]);

  const incrementCopyCount = (): boolean => {
    if (isLoggedIn) {
      return true; // Allow copy for logged-in users
    }

    const newCount = copyCount + 1;
    setCopyCount(newCount);
    localStorage.setItem(COPY_COUNT_KEY, newCount.toString());

    if (newCount >= MAX_FREE_COPIES) {
      setShowLoginModal(true);
      return false; // Block copy action
    }

    return true; // Allow copy
  };

  const canCopy = isLoggedIn || copyCount < MAX_FREE_COPIES;

  return {
    copyCount,
    canCopy,
    showLoginModal,
    setShowLoginModal,
    incrementCopyCount,
    remainingCopies: Math.max(0, MAX_FREE_COPIES - copyCount),
  };
};
