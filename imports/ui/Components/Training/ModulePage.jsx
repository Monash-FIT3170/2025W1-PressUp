import React from "react";
import { useParams } from "react-router-dom";

const ModulePage = () => {
  const { moduleId } = useParams();

  return (
    <div className="module-page">
      <h1>Module Training</h1>
      <p>Training module ID: {moduleId}</p>
      {/* You can fetch full module data here if needed */}
    </div>
  );
};

export default ModulePage;