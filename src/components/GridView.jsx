import React, { useState, useEffect } from 'react';
import './GridView.css';

export default function GridView({ currentTime, weatherData, onBackSwipe }) {
  // --- STATE ---
  const [activeView, setActiveView] = useState('week'); // 'week' or 'month'
  const [viewDate, setViewDate] = useState(new Date()); // Controls the calendar navigation
  
  // Centralized user state (eventually move this to Redux/Context)
  const [users, setUsers] = useState([
    { id: 1, initial: 'D', name: 'Dad', color: '#5eb3a6' },
    { id: 2, initial: 'M', name: 'Mom', color: '#e58e82' },
    { id: 3, initial: 'R', name: 'Rosie', color: '#a78bfa' },
    { id: 4, initial: 'L', name: 'Lily', color: '#86efac' },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Pre-defined color palette for the modal
  const colorPalette = ['#5eb3a6', '#e58e82', '#a78bfa', '#86efac', '#fbbf24', '#60a5fa', '#f472b6', '#94a3b8'];
  const [calendarEvents, setCalendarEvents] = useState({});

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        console.log("Raw Calendar Data:", data);
        setCalendarEvents(data);
      } catch (error) {
        console.error("Failed to fetch calendar:", error);
      }
    }

    fetchCalendar();
  }, []);

  const handleAvatarClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // --- RE-ADDED FUNCTION: Handles updating the specific user's color ---
  const handleColorChange = (newColor) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, color: newColor } : u));
    setIsModalOpen(false);
  };

  // --- TIME TRAVEL LOGIC ---
  const handlePrev = () => {
    const newDate = new Date(viewDate);
    if (activeView === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(viewDate);
    if (activeView === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  const handleToday = () => setViewDate(new Date());

  // Formatting the Header (e.g., "August 2026")
  const monthYearDisplay = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // --- PARSE THE RAW ICAL DATA ---
  // Convert the object into a flat array of valid events
  const parsedEvents = Object.values(calendarEvents).filter(
    (item) => item.type === 'VEVENT'
  );

  // --- MONTH GRID GENERATOR ---
  const generateMonthGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Pad empty slots before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="month-day empty"></div>);
    }
    
    // Fill the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentCellDate = new Date(year, month, i);
      const isToday = new Date().toDateString() === currentCellDate.toDateString();
      
      // Find all events that happen on this specific day
      const dayEvents = parsedEvents.filter((event) => {
        if (!event.start) return false;
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === currentCellDate.toDateString();
      });

      days.push(
        <div key={i} className={`month-day ${isToday ? 'is-today' : ''}`}>
          <span className="day-number">{i}</span>
          
          {/* Render the matching events for this day */}
          <div className="day-events-container">
            {dayEvents.map((evt, idx) => (
              <div key={idx} className="calendar-event-pill">
                <span className="event-time">
                  {new Date(evt.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
                <span className="event-summary">{evt.summary}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="grid-view-container">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <nav className="sidebar">
        <div className="sidebar-logo">F</div>
        <div className="nav-items">
          <button 
            className={`nav-btn ${activeView === 'week' ? 'active' : ''}`}
            onClick={() => setActiveView('week')}
          >
            📅 Week
          </button>
          <button 
            className={`nav-btn ${activeView === 'month' ? 'active' : ''}`}
            onClick={() => setActiveView('month')}
          >
            🗓️ Month
          </button>
        </div>
        <button className="nav-btn back-btn" onClick={onBackSwipe}>← Back</button>
      </nav>

      <div className="main-area">
        {/* TOP HEADER */}
        <header className="top-header">
          <div className="header-left">
            <h1>Family Hub</h1>
            <span className="time">{formattedTime}</span>
            <span className="weather">{weatherData.condition} {weatherData.temp}</span>
          </div>
          
          <div className="header-right">
            <div className="user-avatars">
              {users.map((user) => (
                <button 
                  key={user.id} 
                  className="avatar-btn" 
                  style={{ backgroundColor: user.color }}
                  onClick={() => handleAvatarClick(user)}
                >
                  {user.initial}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* CALENDAR NAVIGATION BAR */}
        <div className="calendar-controls">
          <button className="control-btn" onClick={handlePrev}>&lt;</button>
          <h2 className="current-month-display">{monthYearDisplay}</h2>
          <button className="control-btn" onClick={handleNext}>&gt;</button>
          <button className="control-btn btn-today" onClick={handleToday}>Today</button>
        </div>

        {/* DYNAMIC CALENDAR AREA */}
        <main className="calendar-view">
          {activeView === 'month' ? (
            
            /* --- FULL MONTH VIEW --- */
            <div className="month-grid-container">
              <div className="month-header-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="month-header-cell">{d}</div>
                ))}
              </div>
              <div className="month-grid-body">
                {generateMonthGrid()}
              </div>
            </div>

          ) : (
            
            /* --- WEEK VIEW (Placeholder for now) --- */
            <div className="week-grid-container" style={{padding: '2rem'}}>
              <h3>Week of {viewDate.toLocaleDateString()}</h3>
              <p style={{color: '#888'}}>Time-blocked grid goes here...</p>
            </div>

          )}
        </main>
      </div>

      {/* COLOR MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Customize {selectedUser?.name}'s Color</h3>
            <div className="color-grid">
              {colorPalette.map(color => (
                <button 
                  key={color} 
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}