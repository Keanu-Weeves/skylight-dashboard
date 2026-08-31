import React, { useState, useEffect } from 'react';
import './GridView.css';

export default function GridView({ currentTime, weatherData, onBackSwipe }) {
  // --- STATE ---
  const [activeView, setActiveView] = useState('week'); // 'day', 'week', 'month'
  const [viewDate, setViewDate] = useState(new Date()); 
  
  // Users now have avatars!
  const [users, setUsers] = useState([
    { id: 1, initial: 'D', name: 'Dad', color: '#5eb3a6', avatar: '👨' },
    { id: 2, initial: 'M', name: 'Mom', color: '#e58e82', avatar: '👩' },
    { id: 3, initial: 'R', name: 'Rosie', color: '#a78bfa', avatar: '👧' },
    { id: 4, initial: 'L', name: 'Lily', color: '#86efac', avatar: '👶' },
  ]);

  // Data States
  const [calendarEvents, setCalendarEvents] = useState({});
  const [localEvents, setLocalEvents] = useState([]); // User-added events

  // Modal States
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', start: '09:00', end: '10:00', userId: 1 });

  const formattedTime = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const colorPalette = ['#5eb3a6', '#e58e82', '#a78bfa', '#86efac', '#fbbf24', '#60a5fa', '#f472b6', '#94a3b8'];
  const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  // Fetch Google Calendar
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        setCalendarEvents(data);
      } catch (error) {
        console.error("Failed to fetch calendar:", error);
      }
    }
    fetchCalendar();
  }, []);

  // --- DATA MERGING ---
  // Combine Google events and Local custom events into one flat array
  const allEvents = [
    ...Object.values(calendarEvents)
      .filter((item) => item.type === 'VEVENT')
      .map(e => ({
        id: e.uid,
        title: e.summary,
        start: new Date(e.start),
        end: new Date(e.end || e.start),
        isGoogle: true
      })),
    ...localEvents
  ];

  // --- EVENT HANDLERS ---
  const handleColorChange = (newColor) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, color: newColor } : u));
    setIsColorModalOpen(false);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    const startStr = `${newEvent.date}T${newEvent.start}:00`;
    const endStr = `${newEvent.date}T${newEvent.end}:00`;
    
    const createdEvent = {
      id: Date.now(),
      title: newEvent.title,
      start: new Date(startStr),
      end: new Date(endStr),
      userId: newEvent.userId,
      isGoogle: false
    };

    setLocalEvents([...localEvents, createdEvent]);
    setIsAddEventOpen(false);
    setNewEvent({ title: '', date: '', start: '09:00', end: '10:00', userId: 1 }); // Reset
  };

  // --- TIME TRAVEL LOGIC ---
  const handlePrev = () => {
    const newDate = new Date(viewDate);
    if (activeView === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (activeView === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(viewDate);
    if (activeView === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (activeView === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  const handleToday = () => {
    setViewDate(new Date());
    setActiveView('day'); // Force switch to day view when checking today
  };

  const headerDisplay = activeView === 'month' 
    ? viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : activeView === 'week'
      ? `Week of ${viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // --- RENDER HELPERS ---
  
  // 1. Month View Generator
  const generateMonthGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
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
      
      // Filter the MERGED allEvents array for this day
      const dayEvents = allEvents.filter((event) => {
        if (!event.start) return false;
        return event.start.toDateString() === currentCellDate.toDateString();
      });

      days.push(
        <div key={i} className={`month-day ${isToday ? 'is-today' : ''}`}>
          <span className="day-number">{i}</span>
          
          <div className="day-events-container">
            {dayEvents.map((evt, idx) => {
              // Find the user to apply their color to the month view pill
              const user = users.find(u => u.id === evt.userId);
              const pillColor = user ? user.color : '#5eb3a6'; // Fallback for Google events

              return (
                <div 
                  key={idx} 
                  className="calendar-event-pill"
                  style={{ borderLeftColor: pillColor, backgroundColor: `${pillColor}22` }}
                >
                  <span className="event-time">
                    {evt.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span className="event-summary">{evt.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  // 2. Day/Week View Generator
  const renderTimeBlockedEvents = (targetDate) => {
    const dayEvents = allEvents.filter(e => e.start.toDateString() === targetDate.toDateString());
    
    return dayEvents.map((event, idx) => {
      const topPos = (event.start.getHours() * 60) + event.start.getMinutes();
      const durationMins = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
      const height = Math.max(durationMins, 30); 

      const user = users.find(u => u.id === event.userId);
      const bgColor = user ? user.color : '#a0aab2'; 
      const borderColor = user ? user.color : '#7a858f';

      return (
        <div 
          key={idx} 
          className="time-blocked-event"
          style={{ 
            top: `${topPos}px`, 
            height: `${height}px`, 
            backgroundColor: `${bgColor}33`, 
            borderLeft: `4px solid ${borderColor}`
          }}
        >
          <span className="event-title">{event.title}</span>
          <div className="event-meta">
            <span>{event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
            {user && <span className="event-avatar">{user.avatar}</span>}
          </div>
        </div>
      );
    });
  };

  const getWeekDays = () => {
    const start = new Date(viewDate);
    start.setDate(start.getDate() - start.getDay()); 
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  return (
    <div className="grid-view-container">
      
      {/* SIDEBAR NAVIGATION */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 100 100" width="55" height="55" xmlns="http://www.w3.org/2000/svg">
            {/* The y-offset is slightly lower than 50 because cursive fonts have sweeping ascenders */}
            <text 
              x="50" 
              y="55" 
              className="calligraphy-e"
              textAnchor="middle" 
              dominantBaseline="middle"
            >
              E
            </text>
          </svg>
          </div>        
        <div className="nav-items">
          <button className={`nav-btn ${activeView === 'day' ? 'active' : ''}`} onClick={() => setActiveView('day')}>
            ⏱️ Day
          </button>
          <button className={`nav-btn ${activeView === 'week' ? 'active' : ''}`} onClick={() => setActiveView('week')}>
            📅 Week
          </button>
          <button className={`nav-btn ${activeView === 'month' ? 'active' : ''}`} onClick={() => setActiveView('month')}>
            🗓️ Month
          </button>
        </div>
        <button className="nav-btn back-btn" onClick={onBackSwipe}>← Back</button>
      </nav>

      <div className="main-area">
        {/* HEADER */}
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
                  onClick={() => { setSelectedUser(user); setIsColorModalOpen(true); }}
                >
                  {user.initial}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* CALENDAR CONTROLS */}
        <div className="calendar-controls">
          <button className="control-btn" onClick={handlePrev}>&lt;</button>
          <h2 className="current-month-display">{headerDisplay}</h2>
          <button className="control-btn" onClick={handleNext}>&gt;</button>
          <button className="control-btn btn-today" onClick={handleToday}>Today</button>
        </div>

        {/* MAIN CALENDAR RENDERER */}
        <main className="calendar-view">
          
          {activeView === 'month' && (
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
          )}

          {activeView === 'week' && (
            <div className="time-grid-scroll-wrapper">
              <div className="time-column">
                <div className="time-header-spacer"></div>
                {HOURS.map(h => (
                  <div key={h} className="hour-slot">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</div>
                ))}
              </div>
              <div className="days-columns-container">
                {getWeekDays().map(day => (
                  <div key={day.toISOString()} className="day-column">
                    <div className="day-column-header">
                      {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </div>
                    <div className="day-column-grid">
                      {HOURS.map(h => <div key={h} className="grid-cell-line"></div>)}
                      {renderTimeBlockedEvents(day)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'day' && (
            <div className="time-grid-scroll-wrapper day-focus">
              <div className="time-column">
                {HOURS.map(h => (
                  <div key={h} className="hour-slot">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</div>
                ))}
              </div>
              <div className="day-column-grid single-day">
                {HOURS.map(h => <div key={h} className="grid-cell-line"></div>)}
                {renderTimeBlockedEvents(viewDate)}
              </div>
            </div>
          )}
          
          {/* FLOATING ADD BUTTON */}
          <button className="fab-add" onClick={() => setIsAddEventOpen(true)}>+</button>
        </main>
      </div>

      {/* COLOR MODAL */}
      {isColorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsColorModalOpen(false)}>
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
            <button className="btn-close" onClick={() => setIsColorModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {isAddEventOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEventOpen(false)}>
          <div className="modal-content add-event-form" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Event</h3>
            <form onSubmit={handleAddEvent}>
              <input 
                type="text" placeholder="Event Title (e.g., Grocery Run)" required
                value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              />
              <input 
                type="date" required
                value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
              <div className="time-inputs">
                <input 
                  type="time" required
                  value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                />
                <span>to</span>
                <input 
                  type="time" required
                  value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})}
                />
              </div>
              
              <div className="user-selector">
                <p>Assign to:</p>
                <div className="avatar-options">
                  {users.map(u => (
                    <div 
                      key={u.id} 
                      className={`avatar-choice ${newEvent.userId === u.id ? 'selected' : ''}`}
                      style={{ backgroundColor: u.color }}
                      onClick={() => setNewEvent({...newEvent, userId: u.id})}
                    >
                      {u.avatar}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => setIsAddEventOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}