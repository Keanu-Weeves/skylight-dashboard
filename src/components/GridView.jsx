import React from 'react';
import './GridView.css';

export default function GridView({ onBackSwipe }) {
  // Using the family members from your GlanceView!
  const users = [
    { initial: 'D', name: 'Dad', color: '#5eb3a6', score: '2/5' },
    { initial: 'M', name: 'Mom', color: '#e58e82', score: '5/5' },
    { initial: 'R', name: 'Rosie', color: '#a78bfa', score: '3/4' },
    { initial: 'L', name: 'Lily', color: '#86efac', score: '1/3' },
  ];

  return (
    <div className="grid-view-container">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <nav className="sidebar">
        <div className="sidebar-logo">F</div>
        <div className="nav-items">
          <button className="nav-btn active">📅 Calendar</button>
          <button className="nav-btn">🧹 Chores</button>
          <button className="nav-btn">⭐ Rewards</button>
          <button className="nav-btn">🍽️ Meals</button>
        </div>
        {/* A manual back button just in case touch drag isn't active on your PC yet */}
        <button className="nav-btn back-btn" onClick={onBackSwipe}>
          ← Back
        </button>
      </nav>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="main-area">
        
        {/* TOP HEADER */}
        <header className="top-header">
          <div className="header-left">
            <h1>Family Hub</h1>
            <span className="time">5:25 PM</span>
            <span className="weather">☀️ 72°</span>
          </div>
          
          <div className="header-right">
            <div className="user-avatars">
              {users.map((user) => (
                <span 
                  key={user.name} 
                  className="avatar" 
                  style={{ backgroundColor: user.color }}
                >
                  {user.initial}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* PROGRESS BARS */}
        <div className="progress-trackers">
          {users.map((user) => (
            <div key={user.name} className="tracker">
              <span className="tracker-name" style={{ color: user.color }}>
                <span className="tracker-dot" style={{ backgroundColor: user.color }}>
                  {user.initial}
                </span>
                {user.name}
              </span>
              <span className="tracker-score">{user.score}</span>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    backgroundColor: user.color, 
                    width: `${(parseInt(user.score.split('/')[0]) / parseInt(user.score.split('/')[1])) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* TIME-BLOCKED CALENDAR GRID */}
        <main className="calendar-view">
          
          {/* Time Column */}
          <div className="time-column">
            <div className="time-slot empty-corner"></div>
            {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'].map(time => (
              <div key={time} className="time-slot">{time}</div>
            ))}
          </div>

          {/* Day Columns (Mon - Fri) */}
          <div className="days-container">
            {['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7'].map(day => (
              <div key={day} className="day-column">
                <div className="day-header">{day}</div>
                <div className="day-grid-lines">
                  {/* Mock Event Block */}
                  {day === 'Tue 4' && (
                    <div className="event-block" style={{ top: '60px', height: '110px', backgroundColor: '#e2f4f2', borderLeft: '4px solid #5eb3a6' }}>
                      <span className="event-time">10:00 - 11:30 AM</span>
                      <span className="event-title">Workout</span>
                      <span className="event-badge" style={{ backgroundColor: '#5eb3a6' }}>D</span>
                    </div>
                  )}
                  {day === 'Thu 6' && (
                    <div className="event-block" style={{ top: '180px', height: '180px', backgroundColor: '#fdf2f0', borderLeft: '4px solid #e58e82' }}>
                      <span className="event-time">12:00 - 3:00 PM</span>
                      <span className="event-title">Daily crashout</span>
                      <span className="event-badge" style={{ backgroundColor: '#e58e82' }}>M</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Action Button */}
          <button className="fab-add">+</button>
        </main>
      </div>
    </div>
  );
}