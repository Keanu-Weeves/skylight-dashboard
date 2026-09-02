import React, { useState, useEffect } from 'react';
import { fetchGridEvents, createGoogleEvent } from '../services/calendarService';
import './GridView.css';

export default function GridView({ currentTime, weatherData, onBackSwipe, hubData, hubMembers, session }) {
  // --- STATE ---
  const [activeView, setActiveView] = useState('week'); 
  const [viewDate, setViewDate] = useState(new Date()); 
  const [calendarEvents, setCalendarEvents] = useState([]);
  
  // Modal States
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState(0);
  
  const defaultUserId = hubMembers?.length > 0 ? hubMembers[0].id : null;
  const [newEvent, setNewEvent] = useState({ title: '', date: '', start: '09:00', end: '10:00', userId: defaultUserId });

  const formattedTime = (currentTime || new Date()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const HOURS = Array.from({ length: 24 }, (_, i) => i); 
  const familyInitial = hubData?.family_name ? hubData.family_name.charAt(0).toUpperCase() : 'H';

  // --- FETCH GOOGLE EVENTS ---
  useEffect(() => {
    const loadEvents = async () => {
      if (!session?.provider_token) return;
      const timeMin = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      const timeMax = new Date(viewDate.getFullYear(), viewDate.getMonth() + 2, 0);
      const events = await fetchGridEvents(session.provider_token, timeMin, timeMax, hubMembers);
      setCalendarEvents(events);
    };
    loadEvents();
  }, [viewDate, session, hubMembers]);

  // --- EVENT HANDLERS ---
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!session?.provider_token) return;
    const startStr = `${newEvent.date}T${newEvent.start}:00`;
    const endStr = `${newEvent.date}T${newEvent.end}:00`;
    const assignedUser = hubMembers.find(u => u.id === newEvent.userId);
    const finalTitle = assignedUser ? `${newEvent.title} - ${assignedUser.name}` : newEvent.title;

    const eventDetails = { title: finalTitle, start: new Date(startStr), end: new Date(endStr) };

    try {
      await createGoogleEvent(session.provider_token, eventDetails);
      setCalendarEvents(prev => [...prev, {
        id: Date.now().toString(),
        title: finalTitle,
        start: eventDetails.start,
        end: eventDetails.end,
        userColor: assignedUser?.color || '#a0aab2',
        isGoogle: true
      }]);
      setIsAddEventOpen(false);
      setNewEvent({ title: '', date: '', start: '09:00', end: '10:00', userId: defaultUserId }); 
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event in Google Calendar.");
    }
  };

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
    setActiveView('day'); 
  };

  const headerDisplay = activeView === 'month' 
    ? viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : activeView === 'week'
      ? `Week of ${viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // --- RENDER HELPERS ---
  const generateMonthGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="month-day empty"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentCellDate = new Date(year, month, i);
      const isToday = new Date().toDateString() === currentCellDate.toDateString();
      const dayEvents = calendarEvents.filter((event) => event.start && event.start.toDateString() === currentCellDate.toDateString());

      days.push(
        <div key={i} className={`month-day ${isToday ? 'is-today' : ''}`}>
          <span className="day-number">{i}</span>
          <div className="day-events-container">
            {dayEvents.map((evt, idx) => (
                <div key={idx} className="calendar-event-pill" style={{ borderLeftColor: evt.userColor, backgroundColor: `${evt.userColor}22` }} onClick={() => setEventToEdit(evt)}>
                  <span className="event-time">{evt.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  <span className="event-summary">{evt.title}</span>
                </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  const renderTimeBlockedEvents = (targetDate) => {
    const dayEvents = calendarEvents.filter(e => e.start.toDateString() === targetDate.toDateString());
    return dayEvents.map((event, idx) => {
      const topPos = (event.start.getHours() * 60) + event.start.getMinutes();
      const durationMins = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
      const height = Math.max(durationMins, 30); 
      return (
        <div key={idx} className="time-blocked-event" style={{ top: `${topPos}px`, height: `${height}px`, backgroundColor: `${event.userColor}33`, borderLeft: `4px solid ${event.userColor}`, cursor: 'pointer' }} onClick={() => setEventToEdit(event)}>
          <span className="event-title">{event.title}</span>
          <div className="event-meta"><span>{event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
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
      <nav className="sidebar">
        <div className="sidebar-logo">
          <svg viewBox="0 0 100 100" width="55" height="55" xmlns="http://www.w3.org/2000/svg">
            <text x="50" y="55" className="calligraphy-e" textAnchor="middle" dominantBaseline="middle">{familyInitial}</text>
          </svg>
        </div>
        <div className="nav-items">
          <button className={`nav-btn ${activeView === 'day' ? 'active' : ''}`} onClick={() => setActiveView('day')}>⏱️ Day</button>
          <button className={`nav-btn ${activeView === 'week' ? 'active' : ''}`} onClick={() => setActiveView('week')}>📅 Week</button>
          <button className={`nav-btn ${activeView === 'month' ? 'active' : ''}`} onClick={() => setActiveView('month')}>🗓️ Month</button>
        </div>
        <button className="nav-btn back-btn" onClick={onBackSwipe}>← Back</button>
      </nav>

      <div className="main-area">
        <header className="top-header">
          <div className="header-left">
            <h1>HearthOS</h1>
            <span className="time">{formattedTime}</span>
            {/*Clickable Weather Module */}
            <span 
              className="weather clickable-weather" 
              onClick={() => { setIsWeatherModalOpen(true); setSelectedForecastDay(0); }}
              style={{ cursor: 'pointer', padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: 'background 0.2s', marginLeft: '15px' }}
              title="View 7-Day Forecast"
            >
              {weatherData?.condition || '☀️'} {weatherData?.temp || '--°'}
            </span>
          </div>
          <div className="header-right">
            <div className="user-avatars">
              {hubMembers.map((user) => (
                <button key={user.id} className="avatar-btn" style={{ backgroundColor: user.color }} title={user.name}>{user.avatar}</button>
              ))}
            </div>
          </div>
        </header>

        <div className="calendar-controls">
          <button className="control-btn" onClick={handlePrev}>&lt;</button>
          <h2 className="current-month-display">{headerDisplay}</h2>
          <button className="control-btn" onClick={handleNext}>&gt;</button>
          <button className="control-btn btn-today" onClick={handleToday}>Today</button>
        </div>

        <main className="calendar-view">
          {activeView === 'month' && (
            <div className="month-grid-container">
              <div className="month-header-row">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="month-header-cell">{d}</div>))}</div>
              <div className="month-grid-body">{generateMonthGrid()}</div>
            </div>
          )}
          {activeView === 'week' && (
            <div className="time-grid-scroll-wrapper">
              <div className="time-column">
                <div className="time-header-spacer"></div>
                {HOURS.map(h => (<div key={h} className="hour-slot">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</div>))}
              </div>
              <div className="days-columns-container">
                {getWeekDays().map(day => (
                  <div key={day.toISOString()} className="day-column">
                    <div className="day-column-header">{day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>
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
                {HOURS.map(h => (<div key={h} className="hour-slot">{h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}</div>))}
              </div>
              <div className="day-column-grid single-day">
                {HOURS.map(h => <div key={h} className="grid-cell-line"></div>)}
                {renderTimeBlockedEvents(viewDate)}
              </div>
            </div>
          )}
          <button className="fab-add" onClick={() => setIsAddEventOpen(true)}>+</button>
        </main>
      </div>

      {/* --- MODALS --- */}
      {/* WEATHER GUI MODAL */}
      {isWeatherModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWeatherModalOpen(false)}>
          <div 
            className="modal-content weather-modal glass-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              width: '95%', 
              maxWidth: '850px', /* width increase for breathing room */
              padding: '40px', 
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.85)', /*dark glass background */
              backdropFilter: 'blur(20px)',
              color: '#fff',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 style={{ margin: '0 0 30px 0', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '2px', opacity: 0.9 }}>
              {hubData?.weather_location?.toUpperCase() || 'YOUR LOCATION'}
            </h3>

            <div className="current-weather-large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
              <span style={{ fontSize: '5.5rem', filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.3))' }}>{weatherData?.condition}</span>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '4.5rem', margin: '0', fontWeight: 'bold', lineHeight: '1' }}>{weatherData?.temp}</h2>
                <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontSize: '1.2rem' }}>Feels like {weatherData?.feelsLike}</p>
              </div>
            </div>

            {/* 7-DAY SELECTOR TABS */}
            <div className="forecast-grid hide-scrollbar" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px' }}>
              {weatherData?.forecast?.map((day, idx) => {
                const isSelected = selectedForecastDay === idx;
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedForecastDay(idx)}
                    className="forecast-day-card" 
                    style={{ 
                      flex: '1', 
                      minWidth: '100px', 
                      padding: '20px 10px', 
                      background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)', 
                      borderRadius: '16px', 
                      border: isSelected ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '12px', fontSize: '1.1rem' }}>{idx === 0 ? 'Today' : day.day}</div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{day.icon}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '1rem' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{day.max}</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{day.min}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HOURLY BREAKDOWN SLIDER */}
            <div className="hourly-breakdown hide-scrollbar" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '25px', marginTop: '20px' }}>
              <h4 style={{ margin: '0 0 20px 0', opacity: 0.9, textAlign: 'left', fontWeight: '400', fontSize: '1.2rem' }}>
                Hourly Forecast: <strong style={{ color: '#fff', fontWeight: '600' }}>{selectedForecastDay === 0 ? 'Today' : weatherData?.forecast?.[selectedForecastDay]?.day}</strong>
              </h4>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '30px', paddingBottom: '10px' }}>
                {weatherData?.forecast?.[selectedForecastDay]?.hourly?.map((hour, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '0.95rem', opacity: 0.7, marginBottom: '10px' }}>{hour.time}</span>
                    <span style={{ fontSize: '2rem', margin: '5px 0 10px 0' }}>{hour.icon}</span>
                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{hour.temp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '35px' }}>
              <button 
                className="btn-close" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} 
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onClick={() => setIsWeatherModalOpen(false)}>
                Close Forecast
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD EVENT MODAL */}
      {isAddEventOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEventOpen(false)}>
          <div className="modal-content add-event-form" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Event</h3>
            <form onSubmit={handleAddEvent}>
              <input type="text" placeholder="Event Title (e.g., Grocery Run)" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <div className="time-inputs">
                <input type="time" required value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} />
                <span>to</span>
                <input type="time" required value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})} />
              </div>
              <div className="user-selector">
                <p>Assign to:</p>
                <div className="avatar-options">
                  {hubMembers.map(u => (
                    <div key={u.id} className={`avatar-choice ${newEvent.userId === u.id ? 'selected' : ''}`} style={{ backgroundColor: u.color }} onClick={() => setNewEvent({...newEvent, userId: u.id})} title={u.name}>
                      {u.avatar}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => setIsAddEventOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save to Google Calendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT DETAILS / VIEW MODAL */}
      {eventToEdit && (
        <div className="modal-overlay" onClick={() => setEventToEdit(null)}>
          <div className="modal-content event-details-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="details-title">{eventToEdit.title}</h3>
            <div className="details-time">
              <strong>Date:</strong> {eventToEdit.start.toLocaleDateString()} <br/>
              <strong>Time:</strong> {eventToEdit.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {eventToEdit.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <p className="google-warning">🗓️ <em>This is synced directly from Google Calendar.</em></p>
            <div className="modal-actions">
              <button className="btn-close" onClick={() => setEventToEdit(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}