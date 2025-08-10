import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerNavbar } from './CustomerNavbar.jsx';
import './PreLoginPage.css';

export const PreLoginPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pre-login-container">
      <CustomerNavbar />
      <div className="pre-login-content">

        {/* Hero Section */}
        <main className="pre-login-main">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                Streamline Your Restaurant Operations
              </h1>
              <p className="hero-subtitle">
                Complete point-of-sale system with inventory management, 
                menu controls, and real-time ordering for modern restaurants.
              </p>
              <div className="hero-buttons">
                <button 
                  onClick={handleGetStarted}
                  className="btn-primary"
                >
                  Get Started
                </button>
                <button 
                  onClick={handleLearnMore}
                  className="btn-secondary"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="features-section">
            <h2>Why Choose Our System?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🛒</div>
                <h3>Point of Sale</h3>
                <p>Easy-to-use POS system for quick order processing and payment handling.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h3>Menu Management</h3>
                <p>Dynamic menu controls with categories and real-time updates.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Inventory Tracking</h3>
                <p>Keep track of ingredients and suppliers with detailed reporting.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Promotions</h3>
                <p>Create and manage promotional campaigns to boost sales.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🪑</div>
                <h3>Table Management</h3>
                <p>Visual table mapping and reservation management system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-time Updates</h3>
                <p>Instant synchronization across all devices and locations.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="pre-login-footer">
          <div className="footer-content">
            <p>&copy; 2025 PressUp POS System. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};