import React, { useState, useEffect } from 'react';
import './GlanceView.css';

export default function GlanceView({ currentTime, weatherData, activeLocation }) {


  const getDayPeriod = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Mock Data
  const upcomingEvents = [
    { title: "UoPeople", date: "Today", userColor: "#5eb3a6" },
    { title: "Crashout", date: "Tomorrow", userColor: "#e58e82" },
    { title: "Pickup from school", date: "Wed 5th", userColor: "#86efac" },
    { title: "Work", date: "Thu 6th", userColor: "#a78bfa" }
  ];

  const weatherForecast = [
    { day: 'Today', high: '74°', low: '62°', icon: '☀️' },
    { day: 'Tomorrow', high: '68°', low: '58°', icon: '⛅' },
    { day: 'Wed', high: '70°', low: '55°', icon: '🌧️' },
  ];

  return (
    <div className={`glance-container bg-${getDayPeriod()}`}>
      <div className="dark-gradient-overlay" />

      <div className="glance-layout">
        
        {/* TOP LEFT: Date, Time & Upcoming */}
        <div className="region-top-left">
          <h2 className="date-text">{formattedDate}</h2>
          <h1 className="time-text">{formattedTime}</h1>
          
          <div className="upcoming-list">
            <h3 className="list-header">UPCOMING</h3>
            <hr className="divider" />
            {upcomingEvents.map((evt, idx) => (
              <div key={idx} className="event-row">
                <span className="event-dot" style={{ backgroundColor: evt.userColor }}></span>
                <span className="event-title">{evt.title}</span>
                <span className="event-date">{evt.date}</span>
              </div>
            ))}
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
            <h3 className="location-text">HOME, NY</h3>
          </div>
          <hr className="divider right-align" />
          
          <div className="current-weather">
            <span className="weather-icon-large">☀️</span>
            <div className="temp-block">
              <span className="current-temp">72°</span>
              <span className="feels-like">Feels like 74°</span>
            </div>
          </div>

          <div className="forecast-list">
            <h3 className="list-header right-align">FORECAST</h3>
            <hr className="divider right-align" />
            {weatherForecast.map((day, idx) => (
              <div key={idx} className="forecast-row">
                <span className="forecast-day">{day.day}</span>
                <span className="forecast-icon">{day.icon}</span>
                <span className="forecast-high">{day.high}</span>
                <span className="forecast-low">{day.low}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Greeting */}
        <div className="region-center">
          <h1 className="greeting-text">Hey Bootiful</h1>
        </div>

        {/* BOTTOM: Dots & Ticker */}
        <div className="region-bottom">
          
          {/* iOS Style Swipe Dots */}
          <div className="pagination-dots">
            <span className="dot"></span>
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>

          <div className="ticker-wrap">
            <div className="ticker-move">
              <span className="ticker-item"><strong>New York Times</strong> | World War 3 is here!</span>
              <span className="ticker-item warning-text">
                <span className="pulse-icon">⚠️</span> <strong>FDA Alert</strong> | All food poisonous
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}