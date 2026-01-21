import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Notification = ({ type = 'info', message, duration = 4000, onClose }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!message) {
      setShow(false);
      return;
    }
    setShow(true);
    
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={20} />,
          bgColor: '#d4edda',
          borderColor: '#28a745',
          textColor: '#155724',
          iconColor: '#28a745',
        };
      case 'error':
        return {
          icon: <AlertTriangle size={20} />,
          bgColor: '#f8d7da',
          borderColor: '#dc3545',
          textColor: '#721c24',
          iconColor: '#dc3545',
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} />,
          bgColor: '#fff3cd',
          borderColor: '#ffc107',
          textColor: '#856404',
          iconColor: '#ffc107',
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} />,
          bgColor: '#d1ecf1',
          borderColor: '#17a2b8',
          textColor: '#0c5460',
          iconColor: '#17a2b8',
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor } = getIconAndColor();

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -30, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -30, x: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '450px',
          }}
        >
          <div
            style={{
              backgroundColor: bgColor,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: '500',
              color: textColor,
              fontSize: '14px',
            }}
          >
            <div style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
            <div style={{ flex: 1, wordBreak: 'break-word' }}>
              {message}
            </div>
            <button
              onClick={() => setShow(false)}
              style={{
                background: 'none',
                border: 'none',
                color: borderColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                marginLeft: '8px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
