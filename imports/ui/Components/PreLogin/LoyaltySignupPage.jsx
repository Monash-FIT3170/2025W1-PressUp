import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { CustomerNavbar } from './CustomerNavbar.jsx';
import './LoyaltySignupPage.css';

export const LoyaltySignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Basic validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Please provide either an email or phone number' });
      setIsSubmitting(false);
      return;
    }

    // Email validation if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address' });
        setIsSubmitting(false);
        return;
      }
    }

    // Phone validation if provided
    if (formData.phone.trim()) {
      // Accepts formats like 0412345678, 0412 345 678, +61412345678, +61 412 345 678
      const phoneRegex = /^(?:\+?61|0)4\d{8}$/;
      const cleanedPhone = formData.phone.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        setMessage({ type: 'error', text: 'Please enter a valid Australian mobile number (e.g. 0412 345 678)' });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Check if email already exists (if email provided)
      if (formData.email.trim()) {
        const emailCheck = await new Promise((resolve, reject) => {
          Meteor.call('customers.findByEmail', formData.email, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        if (emailCheck.exists) {
          setMessage({ type: 'error', text: 'A customer with this email already exists' });
          setIsSubmitting(false);
          return;
        }
      }

      // Create customer
      const customerId = await new Promise((resolve, reject) => {
        Meteor.call('customers.insert', {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      setMessage({ 
        type: 'success', 
        text: 'Welcome to our loyalty program! You\'ve been successfully signed up and will start earning points with your next purchase.' 
      });
      
      // Reset form after successful signup
      setFormData({ name: '', email: '', phone: '' });
      
      // Redirect back to homepage after delay
      setTimeout(() => {
        navigate('/');
      }, 4500);

    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ 
        type: 'error', 
        text: error.reason || 'An error occurred during signup. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="loyalty-signup-container">
      <CustomerNavbar />
      
      <div className="loyalty-signup-content">
        <div className="signup-card">
          <div className="signup-header">
            <button onClick={handleGoBack} className="back-btn">
              ← Back to Home
            </button>
            <h1>Join Our Loyalty Program</h1>
            <p className="signup-subtitle">
              Start earning points with every purchase and unlock exclusive rewards!
            </p>
          </div>

          <div className="signup-form-section">
            <h2>Sign Up Now</h2>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmitSignup} className="loyalty-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0412 345 678"
                    required
                  />
                </div>
              </div>

              <p className="form-note">
                * Please provide an email and phone number so we can contact you about your rewards and special offers.
              </p>

              <div className="form-actions">
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Join Loyalty Program'}
                </button>
                <button 
                  type="button" 
                  onClick={handleGoBack}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};