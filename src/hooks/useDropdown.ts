import { useState, useRef, useEffect } from 'react';

interface UseDropdownOptions {
  closeDelay?: number;
}

export function useDropdown(options: UseDropdownOptions = {}) {
  const { closeDelay = 200 } = options;
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Xóa timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const open = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const closeWithDelay = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    isOpen,
    open,
    close,
    closeWithDelay,
    toggle,
    setIsOpen,
  };
}
