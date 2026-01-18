import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

const Alert = ({ variant = 'info', children, dismissible = false, onDismiss }) => {
  const [show, setShow] = useState(true);

  const handleDismiss = () => {
    setShow(false);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''}`}
          role="alert"
        >
          {children}
          {dismissible && (
            <button
              type="button"
              className="btn-close"
              onClick={handleDismiss}
              aria-label="Close"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
