import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerNavbar.css';

export const CustomerNavbar = () => {
  const navigate = useNavigate();

  const handleLoyaltySignup = () => {
    navigate('/loyalty-signup');
  };

  const handleStaffLogin = () => {
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="customer-navbar">
      <div className="navbar-content">
        <div className="logo">
          <img src="/images/PressUpLogo.png" id="logo" alt="Logo" onClick={handleHomeClick}/>
          <h1 onClick={handleHomeClick}>PressUp</h1>
        </div>
        <nav className="navbar-nav">
          <button onClick={handleLoyaltySignup} className="nav-link">
            Loyalty Program Signup
          </button>
          <button onClick={handleStaffLogin} className="nav-link staff-login-btn">
            Staff Login
          </button>
        </nav>
      </div>
    </header>
  );
};