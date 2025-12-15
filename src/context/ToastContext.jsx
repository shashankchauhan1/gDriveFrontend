import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext({ showToast: () => {} });

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeout = timers.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
    if (!message) return null;
    const id = createId();
    setToasts((current) => [...current, { id, message, type }]);
    if (duration) {
      const timeout = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timeout);
    }
    return id;
  }, [removeToast]);

  const contextValue = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);


