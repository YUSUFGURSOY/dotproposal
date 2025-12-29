// src/components/PageTransition.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Animasyon ayarları
const animations = {
  initial: { opacity: 0, y: 20 }, // Sayfa ilk açıldığında: Görünmez ve 20px aşağıda
  animate: { opacity: 1, y: 0 },  // Sayfa yüklendiğinde: Görünür ve yerine oturmuş
  exit: { opacity: 0, y: -20 },   // Sayfa kapanırken: Görünmez ve 20px yukarı kayar
  transition: { duration: 0.3 }   // Süre: 0.3 saniye
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={animations.transition}
      style={{ width: '100%', height: '100%' }} // Tam ekran kaplaması için
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;