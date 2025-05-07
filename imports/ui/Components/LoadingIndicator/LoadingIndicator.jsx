import React from "react";
import "./LoadingIndicator.css";

export const LoadingIndicator = () => (
  <div className="loading-indicator">
    <svg
      style={{ width: 40, height: 40 }}
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <circle
        opacity="0.25"
        cx="12"
        cy="12"
        r="10"
        stroke="#fde9bf"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="#fcd581"
        opacity="0.75"
      />
    </svg>
    <span>Loading...</span>
  </div>
);
