import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    type: 'info',
    message: '',
  });

  const showNotification = useCallback((type = 'info', message = '', duration = 4000) => {
    setNotification({
      type,
      message,
    });

    // Auto-clear after duration
    setTimeout(() => {
      setNotification({
        type: 'info',
        message: '',
      });
    }, duration);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification({
      type: 'info',
      message: '',
    });
  }, []);

  // Shorthand methods
  const success = useCallback((message, duration) => showNotification('success', message, duration), [showNotification]);
  const error = useCallback((message, duration) => showNotification('error', message, duration), [showNotification]);
  const warning = useCallback((message, duration) => showNotification('warning', message, duration), [showNotification]);
  const info = useCallback((message, duration) => showNotification('info', message, duration), [showNotification]);

  return {
    notification,
    showNotification,
    clearNotification,
    success,
    error,
    warning,
    info,
  };
};
