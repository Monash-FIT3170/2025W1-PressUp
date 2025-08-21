import React, { useState } from 'react';
import './PromotionMessage.css';

export const SendPromotionMessage = ({ onClose }) => {
  const [form, setForm] = useState({
    method: 'email',
    subject: '',
    message: '',
    recipientType: 'all',
    recipientValue: '',
    scheduleType: 'now',
    scheduledAt: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      method: form.method,
      subject: form.method === 'email' ? form.subject : undefined,
      message: form.message,
      recipient: {
        type: form.recipientType,
        value: form.recipientType === 'all' ? undefined : form.recipientValue,
      },
      scheduling: {
        type: form.scheduleType,
        scheduledAt: form.scheduleType === 'scheduled' ? new Date(form.scheduledAt) : undefined,
      },
    };

    try {
      // Replace with your actual API call
      // await Meteor.callAsync('promotions.share', data);
      console.log('Sending promotion message:', data);
      alert(`Promotion message ${form.scheduleType === 'now' ? 'sent' : 'scheduled'} via ${form.method}!`);
      
      // Reset form
      setForm({
        method: 'email',
        subject: '',
        message: '',
        recipientType: 'all',
        recipientValue: '',
        scheduleType: 'now',
        scheduledAt: '',
      });
      onClose?.(); // Automatically close form if `onClose` is provided
    } catch (err) {
      alert(err.reason || 'An error occurred while sending the promotion message.');
    }
  };

  return (
    <div className="send-promotion-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Send Promotional Message</h3>
        <button type="button" className="close-button" onClick={onClose}>✕</button>
      </div>

      <label>Send Method:</label>
      <select name="method" value={form.method} onChange={handleChange}>
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </select>

      {form.method === 'email' && (
        <>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Special Promotion - Don't Miss Out!"
            required
          />
        </>
      )}

      <label>Message:</label>
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Enter promotional message here..."
        rows="4"
        required
        style={{ 
          width: '100%', 
          minHeight: '80px', 
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />

      {form.recipientType !== 'all' && (
        <>
          <label>
            {form.recipientType === 'segment' ? 'Segment Name:' : 'Customer Email/Phone:'}
          </label>
          <input
            type="text"
            name="recipientValue"
            value={form.recipientValue}
            onChange={handleChange}
            placeholder={
              form.recipientType === 'segment' 
                ? 'e.g., VIP Customers, Frequent Buyers' 
                : form.method === 'email' 
                  ? 'customer@example.com' 
                  : '+1234567890'
            }
            required
          />
        </>
      )}

      <label>Scheduling:</label>
      <select name="scheduleType" value={form.scheduleType} onChange={handleChange}>
        <option value="now">Send Now</option>
        <option value="scheduled">Schedule for Later</option>
      </select>

      {form.scheduleType === 'scheduled' && (
        <>
          <label>Send At:</label>
          <input
            type="datetime-local"
            name="scheduledAt"
            value={form.scheduledAt}
            onChange={handleChange}
            required
          />
        </>
      )}

      <button type="button" onClick={handleSubmit}>
        {form.scheduleType === 'now' ? `Send ${form.method.toUpperCase()}` : 'Schedule Message'}
      </button>
    </div>
  );
};