import React from 'react';
import './TrainingCard.css';

const TrainingCard = ({ module }) => {
  const { id, title, description, duration, createdAt } = module;

  // formatting of the training card
  const formatAEST = (date) => {
    try {
      return new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Melbourne',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch (_) {
      return date.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
    }
  };

  return (
    <div className="training-card">
      <div className="tc-content">
      <div className="tc-head">
        <h3 className="tc-title">{title}</h3>
        <span className="tc-time">Created at: {formatAEST(new Date(createdAt))}</span>
      </div>
      <div className="tc-info">
        <p className="tc-description">{description}</p>
        <p className="tc-duration">Duration: {duration}</p>
      </div>
      </div>
      
      <div className="tc-actions">
        <button className="start" onClick={() => alert(`Starting training: ${title}`)}>
          Start Training
        </button>
      </div>
    </div>
  );
};

export default TrainingCard;