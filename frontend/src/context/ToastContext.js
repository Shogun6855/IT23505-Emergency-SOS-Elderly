import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomToast from '../components/ui/CustomToast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      createdAt: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration + animation time
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 500);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    dismiss: removeToast,
    clear: () => setToasts([])
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map((toastData, index) => (
          <div
            key={toastData.id}
            className="pointer-events-auto transform transition-all duration-300 ease-out"
            style={{
              zIndex: 1000 - index,
              animationDelay: `${index * 100}ms`
            }}
          >
            <CustomToast
              type={toastData.type}
              message={toastData.message}
              duration={toastData.duration}
              onClose={() => removeToast(toastData.id)}
              position="top-right"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;