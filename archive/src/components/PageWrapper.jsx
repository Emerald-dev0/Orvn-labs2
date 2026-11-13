import React from 'react';
import { motion } from 'framer-motion';

export default function PageWrapper({ children }) {
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: '60vh' }}
    >
      {children}
    </motion.main>
  );
}
