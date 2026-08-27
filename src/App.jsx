import React, { useState, useEffect } from 'react';
import './App.css';

export default function APP() {
  //for later
  const [timeOfDay, setTimeOfDay] = useState('morning');

  return (
    <div className={`app-container bg-${timeOfDay}`}>
      {/*Header w/ clock, weather, user selcetors */}
      <header className="dashboard-header">
        <div className="widget-box">Clock & Weather</div>
        <div className="widget-box">Users</div>
      </header>
      {/* Main calendar */}
      <main className="dashboard-main">
        <div className="widget-box calendar-container">
          <h2>Calendar View</h2>
        </div>
      </main>
      {/*Chores, Meals, News, Recalls, etc. */}
      <footer calssName="dashboard-footer">
        <div className="widget-box">Chores & Tasks</div>
        <div className="widget-box">Meal & Plan</div>
        <div className="widget-box">News & Recalls</div>
      </footer>
    </div>
  );
}