import React, { useState } from 'react';
import './TaskView.css';

export default function TaskView() {
  // Added 'groceries' to our possible tabs
  const [activeTab, setActiveTab] = useState('chores');

  const renderContent = () => {
    switch (activeTab) {
      case 'chores':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Chores & Tasks</h2>
              <button className="btn-primary">+ Add Item</button>
            </div>
            <div className="chores-split-view">
              <div className="list-section">
                <h3>One-off Tasks</h3>
                <div className="mock-item">
                  <input type="checkbox" /> <span>Call Plumber</span>
                </div>
              </div>
              <div className="list-section">
                <h3>Recurring Chores</h3>
                <div className="mock-item">
                  <input type="checkbox" /> <span>Clean Kitchen (Daily)</span>
                  <span className="badge badge-mom">M</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'meals':
        return (
          <div className="tab-content">
             <div className="content-header">
              <h2>Meal Prep & Recipes</h2>
              <button className="btn-primary">+ New Recipe</button>
            </div>
            <div className="meal-grid">
              <div className="meal-card">🌮 Family Taco Night</div>
              <div className="meal-card">🥗 Grilled Chicken Salad</div>
              <div className="meal-card">🍝 Spaghetti Bolognese</div>
            </div>
          </div>
        );
      case 'groceries':
        return (
          <div className="tab-content">
             <div className="content-header">
              <h2>Grocery List</h2>
              <div className="header-actions">
                <button className="btn-secondary">Clear Checked</button>
                <button className="btn-primary">+ Add Item</button>
              </div>
            </div>
            
            <div className="grocery-layout">
              {/* Left Side: The Categorized List */}
              <div className="grocery-categories">
                <div className="category-block">
                  <h3 className="category-title">🥦 Produce</h3>
                  <div className="mock-item"><input type="checkbox" /> <span>Cilantro (for Tacos)</span></div>
                  <div className="mock-item"><input type="checkbox" /> <span>Avocados x4</span></div>
                </div>
                <div className="category-block">
                  <h3 className="category-title">🥛 Dairy & Fridge</h3>
                  <div className="mock-item"><input type="checkbox" /> <span>Whole Milk</span></div>
                  <div className="mock-item"><input type="checkbox" defaultChecked /> <span className="checked-text">Sour Cream</span></div>
                </div>
              </div>

              {/* Right Side: QR Code to take list to store */}
              <div className="grocery-qr-sidebar">
                <div className="qr-box">
                  <div className="qr-placeholder">📱 QR</div>
                  <p>Scan to take list<br/>to the store</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'recalls':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h2>Active Food Recalls</h2>
              <span className="live-indicator">● Live FDA Feed</span>
            </div>
            <div className="recall-feed">
              <div className="recall-alert severity-high">
                <strong>⚠️ Class I Recall:</strong> Organic Romaine Lettuce (E. Coli)
              </div>
              <div className="recall-alert severity-med">
                <strong>Class II Recall:</strong> Brand X Peanut Butter (Undeclared allergens)
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="task-view-container">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <nav className="sidebar">
        <div className="sidebar-logo">✓</div>
        <div className="nav-items">
          <button 
            className={`nav-btn ${activeTab === 'chores' ? 'active' : ''}`}
            onClick={() => setActiveTab('chores')}
          >
            🧹 Tasks
          </button>
          <button 
            className={`nav-btn ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            🍽️ Meals
          </button>
          <button 
            className={`nav-btn ${activeTab === 'groceries' ? 'active' : ''}`}
            onClick={() => setActiveTab('groceries')}
          >
            🛒 Groceries
          </button>
          <button 
            className={`nav-btn ${activeTab === 'recalls' ? 'active' : ''}`}
            onClick={() => setActiveTab('recalls')}
          >
            ⚠️ Recalls
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-area">
        {renderContent()}
      </main>
    </div>
  );
}