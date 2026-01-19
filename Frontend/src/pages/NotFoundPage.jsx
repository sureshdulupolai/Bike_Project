import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home, ArrowRight } from 'lucide-react';

const NotFoundPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
    },
    bounce: {
      y: [0, -20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut', delay: 0.3 },
    },
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="position-absolute"
        style={{
          top: '-5%',
          right: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1,
          zIndex: 0,
        }}
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="position-absolute"
        style={{
          bottom: '-5%',
          left: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          opacity: 0.1,
          zIndex: 0,
        }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Main content */}
      <motion.div
        className="container text-center position-relative"
        style={{ zIndex: 1, maxWidth: '600px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon with bounce effect */}
        <motion.div
          className="mb-5"
          variants={iconVariants}
          animate={['visible', 'bounce']}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            }}
          >
            <AlertCircle size={60} color="white" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.h1
          className="fw-bold mb-4"
          style={{
            fontSize: '120px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1',
            marginBottom: '0.5rem !important',
          }}
          variants={numberVariants}
        >
          404
        </motion.h1>

        {/* Heading */}
        <motion.h2
          className="fw-bold mb-3"
          style={{
            fontSize: '2.5rem',
            color: '#2d3748',
            lineHeight: '1.2',
          }}
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="mb-5 text-muted"
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto 2rem',
          }}
          variants={itemVariants}
        >
          Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
        </motion.p>

        {/* Buttons Container */}
        <motion.div
          className="d-flex flex-column flex-sm-row gap-3 justify-content-center"
          variants={itemVariants}
        >
          {/* Home Button */}
          <Link
            to="/"
            className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50px',
              padding: '12px 40px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              color: 'white',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
              minWidth: '200px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
            }}
          >
            <Home size={20} />
            Go Home
          </Link>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline-primary btn-lg fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{
              borderColor: '#667eea',
              color: '#667eea',
              borderRadius: '50px',
              padding: '12px 40px',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              minWidth: '200px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ArrowRight size={20} />
            Go Back
          </button>
        </motion.div>

        {/* Footer text */}
        <motion.p
          className="mt-5 text-muted"
          style={{ fontSize: '0.9rem' }}
          variants={itemVariants}
        >
          If you believe this is a mistake, please{' '}
          <Link to="/contact" className="text-primary text-decoration-none fw-bold">
            contact us
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
