import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlanceView from './components/GlanceView';
import GridView from './components/GridView';
import './App.css';

export default function App() {
  // State to track which screen is active
  const [activeScreen, setActiveScreen] = useState('glance');

  // Framer Motion animation variants for the slide effect
  const slideVariants = {
    enter: (direction) => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 'right' ? -1000 : 1000,
      opacity: 0,
    }),
  };

  // Determine direction for the animation
  const direction = activeScreen === 'grid' ? 'right' : 'left';

  // The gesture handler: swipes switch screens
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (swipePower < -swipeThreshold && activeScreen === 'glance') {
      // Swiped left
      setActiveScreen('grid');
    } else if (swipePower > swipeThreshold && activeScreen === 'grid') {
      // Swiped right
      setActiveScreen('glance');
    }
  };

  return (
    <div className="app-container">
      {/* AnimatePresence handles the unmounting/mounting transition */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeScreen}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="screen-wrapper"
        >
          {activeScreen === 'glance' ? (
            <GlanceView />
          ) : (
            <GridView onBackSwipe={() => setActiveScreen('glance')} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}