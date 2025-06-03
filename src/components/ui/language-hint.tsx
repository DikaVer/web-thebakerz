'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface LanguageHintProps {
  show: boolean;
  onDismiss: () => void;
}

export const LanguageHint = ({ show, onDismiss }: LanguageHintProps) => {
  if (!show) return null;

  return (
    <motion.div
      className="absolute top-4 right-[179px] z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Hand-drawn SVG elements */}
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        className="absolute -top-6"
      >
        {/* Hand-drawn circle */}
        <motion.circle
          cx="160"
          cy="40"
          r="20"
          fill="none"
          stroke="#a2119d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="0 157"
          initial={{ strokeDasharray: "0 157" }}
          animate={{ strokeDasharray: "157 157" }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))',
            transform: 'rotate(-5deg)',
          }}
        />
        
        {/* Hand-drawn arrow - pointing right toward the button */}
        <motion.g
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
        >
          <path
            d="M 60 55 Q 90 35 125 45"
            fill="none"
            stroke="#a2119d"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 1px 3px rgba(139, 92, 246, 0.3))',
            }}
          />
          {/* Arrow head - pointing right toward the button */}
          <path
            d="M 125 45 L 117 40 M 125 45 L 120 52"
            fill="none"
            stroke="#a2119d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </motion.g>
        
        {/* Decorative dots */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.3 }}
        >
          <circle cx="35" cy="35" r="1.5" fill="#a2119d" opacity="0.6" />
          <circle cx="25" cy="40" r="1" fill="#a2119d" opacity="0.4" />
          <circle cx="20" cy="30" r="1.5" fill="#a2119d" opacity="0.5" />
        </motion.g>
      </svg>

      {/* Hand-drawn style text - now on the left */}
      <motion.div
        className="absolute top-12 -right-[165px] max-w-[200px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0 }}
      >
        <div
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border w-[250px]"
          style={{
            transform: 'rotate(-1deg)',
            filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.15))',
          }}
        >
          <p 
            className="text-sm text-primary font-medium leading-tight flex items-center gap-2"
            style={{
              fontFamily: 'Comic Sans MS, system-ui',
            }}
          >
            Click here to change language <Icon icon="material-symbols:translate" className="text-foreground" width={16} height={16} />
          </p>
          
          {/* Small triangle pointer - pointing right toward the button */}
          {/* <div
            className="absolute -top-2 right-8 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid white',
              filter: 'drop-shadow(0 -2px 4px rgba(139, 92, 246, 0.1))',
            }}
          /> */}
        </div>
      </motion.div>

      {/* Subtle pulsing glow effect - positioned over the language button */}
      {/* <motion.div
        className="absolute top-8 -right-3 w-12 h-12 rounded-full bg-purple-400/20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      /> */}

      {/* Dismiss area (invisible but clickable) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer opacity-0"
        onClick={onDismiss}
        style={{ width: '300px', height: '150px', top: '-20px', left: '-50px' }}
      />
    </motion.div>
  );
}; 