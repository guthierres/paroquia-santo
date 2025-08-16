import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -5, scale: 1.02 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      {...hoverProps}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      {children}
    </Component>
  );
};