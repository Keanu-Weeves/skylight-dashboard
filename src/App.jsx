import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import GlanceView from './components/GlanceView';
import GridView from './components/GridView';
import TaskView from './components/TaskView';
import './App.css';


const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) console.error('Google login error:', error.message);
};
const screens = ['tasks', 'glance', 'grid'];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState(0);

  // --- GLOBAL SHARED STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeLocation, setActiveLocation] = useState('HOME, NY');
  const [weatherData, setWeatherData] = useState({ temp: '72°', condition: '☀️', feelsLike: '74°' });

  // The single source of truth for the clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0 }),
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    const swipeThreshold = 5000; 
    if (swipePower < -swipeThreshold && currentIndex < screens.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else if (swipePower > swipeThreshold && currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const renderScreen = () => {
    if (screens[currentIndex] === 'tasks') return <TaskView />;
    if (screens[currentIndex] === 'glance') return (
      <GlanceView 
        currentTime={currentTime} 
        weatherData={weatherData} 
        activeLocation={activeLocation} 
      />
    );
    if (screens[currentIndex] === 'grid') return (
      <GridView 
        currentTime={currentTime} 
        weatherData={weatherData} 
        onBackSwipe={() => { setDirection(-1); setCurrentIndex(1); }} 
      />
    );
  };

  return (
    <div className="app-container">
      <button 
      onClick={handleGoogleLogin} 
      style={{ padding: '1rem', background: '#4a82a6', color: 'white', zIndex: 9999, position: 'absolute' }}>
        Login with Google
        </button>
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