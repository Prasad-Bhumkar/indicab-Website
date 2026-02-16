import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaArrowRight, FaTaxi } from 'react-icons/fa';

const AnimatedJourney = ({ from, to }) => {
  // Animation variants
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
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
  };

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { duration: 0.4 },
    },
    pulse: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const vehicleVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: 1 },
    },
    travel: {
      x: [0, 220],
      transition: { duration: 3, repeat: Infinity, ease: 'linear', delay: 1 },
    },
  };

  return (
    <motion.div
      className="animated-journey-container"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <svg viewBox="0 0 280 80" className="journey-svg">
        {/* Background gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
            <stop offset="50%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
          </linearGradient>
          <filter id="cabGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated main line */}
        <motion.line
          x1="20"
          y1="40"
          x2="260"
          y2="40"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          variants={lineVariants}
        />

        {/* Dashed animated line for extra effect */}
        <motion.line
          x1="20"
          y1="40"
          x2="260"
          y2="40"
          stroke="#4f46e5"
          strokeWidth="1"
          strokeDasharray="6,4"
          opacity="0.4"
          variants={{
            hidden: { pathLength: 0 },
            visible: {
              pathLength: 1,
              transition: { duration: 2, ease: 'easeInOut', delay: 0.3 },
            },
          }}
        />

        {/* Start point circle */}
        <motion.g variants={itemVariants}>
          <motion.circle
            cx="20"
            cy="40"
            r="7"
            fill="#4f46e5"
            variants={dotVariants}
          />
          <motion.circle
            cx="20"
            cy="40"
            r="7"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            variants={{
              visible: { scale: 1 },
              pulse: { scale: [1, 2.2, 1], opacity: [1, 0, 1] },
            }}
            animate="pulse"
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        {/* End point circle */}
        <motion.g variants={itemVariants}>
          <motion.circle
            cx="260"
            cy="40"
            r="7"
            fill="#4f46e5"
            variants={dotVariants}
          />
          <motion.circle
            cx="260"
            cy="40"
            r="7"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
            variants={{
              visible: { scale: 1 },
              pulse: { scale: [1, 2.2, 1], opacity: [1, 0, 1] },
            }}
            animate="pulse"
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
        </motion.g>

        {/* Moving taxi/cab vehicle */}
        <motion.g variants={vehicleVariants} animate="travel" filter="url(#cabGlow)">
          {/* Taxi body */}
          <rect x="-8" y="30" width="16" height="10" rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
          {/* Taxi roof */}
          <polygon points="-6,30 6,30 4,25 -4,25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
          {/* Taxi side stripe */}
          <rect x="-8" y="36" width="16" height="1" fill="#1f2937" opacity="0.4" />
          {/* Taxi windows */}
          <rect x="-6" y="26" width="3" height="3" fill="#1f2937" opacity="0.7" rx="0.5" />
          <rect x="3" y="26" width="3" height="3" fill="#1f2937" opacity="0.7" rx="0.5" />
          {/* Front window */}
          <polygon points="-4,30 4,30 3,28 -3,28" fill="#60a5fa" opacity="0.8" />
          {/* Wheels */}
          <circle cx="-5" cy="40" r="2.5" fill="#1f2937" stroke="#4a5568" strokeWidth="0.5" />
          <circle cx="5" cy="40" r="2.5" fill="#1f2937" stroke="#4a5568" strokeWidth="0.5" />
          {/* Wheel hubs */}
          <circle cx="-5" cy="40" r="1" fill="#4a5568" />
          <circle cx="5" cy="40" r="1" fill="#4a5568" />
          {/* Taxi roof light */}
          <circle cx="0" cy="24" r="1.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
          <circle cx="0" cy="24" r="1.5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.4">
            <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </motion.g>

        {/* Intermediate milestone dots */}
        {[70, 140, 210].map((x, idx) => (
          <motion.circle
            key={idx}
            cx={x}
            cy="40"
            r="3"
            fill="#4f46e5"
            opacity="0.5"
            variants={dotVariants}
            transition={{ delay: 0.3 + idx * 0.1 }}
          />
        ))}
      </svg>

      {/* City labels */}
      <div className="journey-labels">
        <motion.div className="city-label start-label" variants={itemVariants}>
          <FaMapMarkerAlt className="city-icon" />
          <span className="city-name">{from}</span>
        </motion.div>

        <motion.div className="journey-arrow" variants={itemVariants}>
          <FaArrowRight />
        </motion.div>

        <motion.div className="city-label end-label" variants={itemVariants}>
          <span className="city-name">{to}</span>
          <FaMapMarkerAlt className="city-icon" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnimatedJourney;
