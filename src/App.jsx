import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlanceView from './components/GlanceView';
import GridView from './components/GridView';
import TaskView from './components/TaskView';
import './App.css';

// order of screens from left to right
const screens = ['tasks', 'glance', 'grid'];

export default function App() {
  // start at index 1 
  const [currentIndex, setCurrentIndex] = useState(1);
  
  // Track swipe direction (1 for swiping left/moving forward, -1 for swiping right/moving backward)
  const [direction, setDirection] = useState(0);

  // Framer Motion animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    // Determine how hard/far the user swiped
    const swipePower = Math.abs(offset.x) * velocity.x;
    const swipeThreshold = 5000; // Adjust this if it feels too sensitive or too stiff

    if (swipePower < -swipeThreshold && currentIndex < screens.length - 1) {
      // Swiped Left (Move to the next screen on the right)
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else if (swipePower > swipeThreshold && currentIndex > 0) {
      // Swiped Right (Move to the previous screen on the left)
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Helper to render the correct component
  const renderScreen = () => {
    if (screens[currentIndex] === 'tasks') return <TaskView />;
    if (screens[currentIndex] === 'glance') return <GlanceView />;
    if (screens[currentIndex] === 'grid') return <GridView onBackSwipe={() => { setDirection(-1); setCurrentIndex(1); }} />;
  };

  return (
    <div className="app-container">
      {/* custom={direction} tells Framer Motion which way to slide the animations */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
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
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}