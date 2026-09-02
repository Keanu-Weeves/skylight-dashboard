import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { fetchUpcomingCalendarEvents } from './services/calendarService';
import { fetchLocalWeather } from './services/weatherService'; // <--- WEATHER IMPORT ADDED
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './LoginScreen';
import SettingsModal from './components/SettingsModal';
import GlanceView from './components/GlanceView';
import GridView from './components/GridView';
import TaskView from './components/TaskView';
import './App.css';

const screens = ['tasks', 'glance', 'grid'];

export default function App() {
  // --- AUTHENTICATION & HUB STATE ---
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [hasHubSetup, setHasHubSetup] = useState(false);
  const [hubData, setHubData] = useState(null);
  const [hubMembers, setHubMembers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // --- DASHBOARD NAVIGATION STATE ---
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState(0);

  // --- GLOBAL SHARED STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState(null);

  // Auth & Database Listener
  useEffect(() => {
    const checkHub = async (userId) => {
      // Fetch the user's specific hub settings
      const { data: hub } = await supabase.from('hubs').select('*').eq('owner_id', userId).single();
      
      if (hub) {
        // If hub exists, fetch members
        const { data: members } = await supabase.from('hub_members').select('*').eq('hub_id', hub.id);
        
        setHubData(hub);
        setHubMembers(members || []);
        setHasHubSetup(true);
      } else {
        setHasHubSetup(false);
      }
      setLoadingAuth(false);
    };

    // Check on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkHub(session.user.id);
      else setLoadingAuth(false);
    });

    // Listen for sign-ins / sign-outs
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkHub(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Source of truth for the clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load events when session and hubMembers are ready
  useEffect(() => {
    async function loadEvents() {
      if (session?.provider_token) {
        const events = await fetchUpcomingCalendarEvents(session.provider_token, hubMembers);
        setUpcomingEvents(events);
      }
    }
    loadEvents();
  }, [session, hubMembers]);

  // --- FETCH LIVE WEATHER ---
  useEffect(() => {
    async function loadWeather() {
      if (hubData?.weather_location) {
        const liveWeather = await fetchLocalWeather(hubData.weather_location);
        setWeatherData(liveWeather);
      }
    }
    loadWeather();
    
    // Refresh weather every 30 minutes so it stays accurate
    const weatherInterval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [hubData?.weather_location]);

  // --- SWIPE ANIMATION LOGIC ---
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

  const handleManualNavigate = (targetIndex) => {
    if (targetIndex === currentIndex) return;
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setCurrentIndex(targetIndex);
  };

  const renderScreen = () => {
    if (screens[currentIndex] === 'tasks') return <TaskView hubData={hubData} hubMembers={hubMembers} />;
    if (screens[currentIndex] === 'glance') return (
      <GlanceView
        currentTime={currentTime}
        weatherData={weatherData}
        activeLocation={hubData ? hubData.weather_location : 'Dawsonville, GA'}
        hubData={hubData}
        hubMembers={hubMembers}
        upcomingEvents={upcomingEvents}
        goToScreen={handleManualNavigate}
      />
    );
    if (screens[currentIndex] === 'grid') return (
      <GridView
        currentTime={currentTime}
        weatherData={weatherData}
        onBackSwipe={() => { setDirection(-1); setCurrentIndex(1); }}
        hubData={hubData}
        hubMembers={hubMembers}
        session={session}
      />
    );
  };

  // --- APP ROUTER ---

  // Checking keys on initial load
  if (loadingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff' }}>
        Igniting HearthOS...
      </div>
    );
  }

  // Not logged in -> Show the brand Lock Screen
  if (!session) {
    return <LoginScreen />;
  }

  // Logged in, but needs to set up Hub
  if (session && !hasHubSetup) {
    return (
      <SettingsModal 
        session={session} 
        isOnboarding={true} 
        // Once they save, trigger a re-fetch
        onComplete={() => setHasHubSetup(true)} 
      />
    );
  }

  // Logged in & Hub Setup, Render the swipeable hub
  return (
    <div className="app-container">
      
      {/* Settings Gear in the Bottom Right */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '50px',
          height: '50px',
          background: 'rgba(126, 126, 126, 0.1)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        ⚙️
      </button>

      {/* Render Settings Modal conditionally as an overlay */}
      {showSettings && (
        <SettingsModal 
          session={session} 
          isOnboarding={false} 
          onClose={() => setShowSettings(false)} 
          onComplete={() => {
            setShowSettings(false);
            // window reload to clean fetch new data and re-render UI
            window.location.reload(); 
          }} 
        />
      )}

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