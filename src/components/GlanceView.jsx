import React, { useEffect, useState } from 'react';
import './GlanceView.css';

export default function GlanceView({ currentTime, weatherData, activeLocation, hubData, hubMembers, upcomingEvents = [], goToScreen }) {
  const [newsItems, setNewsItems] = useState([]);

  const getDayPeriod = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const period = getDayPeriod();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // --- DYNAMIC DATABASE VARIABLES ---
  const familyName = hubData?.family_name || 'Family';
  const displayLocation = activeLocation || 'Location Pending';
  
  // Capitalize the first letter of the period for the greeting
  const greetingPeriod = period.charAt(0).toUpperCase() + period.slice(1);

  const videoMap = {
    morning: 'https://kbvxntidhoygnvuewaqx.supabase.co/storage/v1/object/public/background-videos/morning-loop.mp4',
    afternoon: 'https://kbvxntidhoygnvuewaqx.supabase.co/storage/v1/object/public/background-videos/afternoon-loop.mp4',
    evening: 'https://kbvxntidhoygnvuewaqx.supabase.co/storage/v1/object/public/background-videos/evening-loop.mp4',
    night: 'https://kbvxntidhoygnvuewaqx.supabase.co/storage/v1/object/public/background-videos/night-loop.mp4'
  };

  const currentVideo = videoMap[period];

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml')
    .then(res => res.json())
    .then(data => {
      if (data.items) {
        setNewsItems(data.items.slice(0, 3));
      }
    })
    .catch(err => console.error("Error fetching news:", err));
  }, []);

  return (
    <div className="glance-container">
      <video
      key={currentVideo}
      className="background-video"
      autoPlay
      loop
      muted
      playsInline
      >
        <source src={currentVideo} type="video/mp4" />
      </video>
      <div className="dark-gradient-overlay" />

      <div className="glance-layout">
        
        {/* TOP LEFT: Date, Time & Upcoming */}
        <div className="region-top-left">
          <h2 className="date-text">{formattedDate}</h2>
          <h1 className="time-text">{formattedTime}</h1>
          
          <div className="upcoming-list">
            <h3 className="list-header">UPCOMING</h3>
            <hr className="divider" />
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 4).map((evt, idx) => (
                  <div key={idx} className="event-row">
                    <span className="event-dot" style={{ backgroundColor: evt.userColor || 'rgba(255, 255, 255, 0.5)'}}></span>
                    <span className="event-title" style={{ color: "white"}}>{evt.title}</span>
                    <span className="event-date" style={{ color: "white"}}>{evt.date}</span>
                  </div>
                ))
              ) : (
                <div className="event-row" style={{ opacity: 0.6, fontStyle: 'italic', }}>
                  <span className="event-title" style={{ color: "white"}}>Schedule clear</span>
                </div>
              )}
          </div>
        </div>

        {/* TOP RIGHT: Weather & Status */}
        <div className="region-top-right">
          
          {/* System Status & Location */}
          <div className="location-bar">
            <div className="system-status">
              <span className="cpu-dot"></span>
              <span className="wifi-icon">📶</span>
            </div>
            {/* Dynamic Location Injected Here */}
            <h3 className="location-text">{displayLocation.toUpperCase()}</h3>
          </div>
          <hr className="divider right-align" />
          
          <div className="current-weather">
            {/* Dynamic Current Weather */}
            <span className="weather-icon-large">{weatherData?.condition || '☀️'}</span>
            <div className="temp-block">
              <span className="current-temp">{weatherData?.temp || '--°'}</span>
              <span className="feels-like">Feels like {weatherData?.feelsLike || '--°'}</span>
            </div>
          </div>

          <div className="forecast-list">
            <h3 className="list-header right-align">FORECAST</h3>
            <hr className="divider right-align" />
            {/* Dynamically render the first 3 days of the forecast array */}
            {(weatherData?.forecast?.slice(0, 3) || []).map((day, idx) => (
              <div key={idx} className="forecast-row">
                <span className="forecast-day">{idx === 0 ? 'Today' : day.day}</span>
                <span className="forecast-icon">{day.icon}</span>
                <span className="forecast-high">{day.max}</span>
                <span className="forecast-low">{day.min}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Greeting */}
        <div className="region-center">
          {/* Dynamic Greeting Injected Here */}
          <h1 className="greeting-text">Good {greetingPeriod}, {familyName} Family</h1>
        </div>

        {/* BOTTOM: Dots & Ticker */}
        <div className="region-bottom">
          <div className="navigation-controls" style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "15px"
          }}>
              <button className="nav-arrow" onClick={() => goToScreen(0)}>◀ Tasks</button>
            {/* iOS Style Swipe Dots */}
            <div className="pagination-dots">
              <span className="dot" onClick={() => goToScreen(0)} style={{ cursor: 'pointer' }}></span>
              <span className="dot active"></span>
              <span className="dot" onClick={() => goToScreen(2)} style={{ cursor: 'pointer' }}></span>
            </div>

            <button className="nav-arrow" onClick={() => goToScreen(2)}>Calendar ▶</button>
          </div>

          <div className="ticker-wrap">
            <div className="ticker-move">
              {newsItems.length > 0 ? (
                newsItems.map((item, idx) => (
                  <span key={idx} className="ticker-item">
                    <strong>New York Times</strong> | {item.title}
                  </span>
                ))
              ) : (
                <span className="ticker-item">Loading live news...</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}