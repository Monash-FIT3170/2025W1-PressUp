import React from "react";
import { useNavigate } from "react-router-dom";
import './TrainingCard.css';

const TrainingCard = ({ module }) => {
  const navigate = useNavigate();
  const { title, description, duration, createdAt, id } = module;

  const formatAEST = (date) =>
    new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);

  const handleStartTraining = () => {
    navigate(`/training/module/${id}`);
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

      <button className="start" onClick={handleStartTraining}>
        Start Training
      </button>
    </div>
  );
};

export default TrainingCard;