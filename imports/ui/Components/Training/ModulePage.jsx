import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ModulePage.css";

const trainingModules = [
  { id: "1", title: "Food Safety Basics", description: "Learn essential food safety practices.", duration: "30 min", createdAt:"2025-08-15T10:00:00" },
  { id: "2", title: "Customer Service", description: "Best practices for customer interactions.", duration: "45 min", createdAt: "2025-08-15T10:00:00" },
  { id: "3", title: "POS System Training", description: "How to use the Point of Sale system.", duration: "20 min", createdAt: "2025-08-15T10:00:00" },
  { id: "4", title: "Kitchen Operations", description: "Overview of kitchen workflows.", duration: "40 min", createdAt: "2025-08-15T10:00:00" },
  { id: "5", title: "Kitchen Cleaning", description: "Best practices for kitchen cleaning techniques.", duration: "40 min", createdAt: "2025-08-15T10:00:00"}
];

const ModulePage = () => {
  const { id } = useParams();
  const module = trainingModules.find((m) => m.id === id);

  useEffect(() => {
    if (module) {
      document.title = module.title; // sets browser tab
    } else {
      document.title = "Module Not Found";
    }
  }, [module]);

  if (!module) return <div style={{ padding: "20px" }}>Module not found.</div>;

  return (
    <div className="module-page">
      <header className="module-header">
        <h1>{module.title}</h1>
      </header>

      <section className="module-content">
        <h2>Training Content</h2>
        <p>Welcome to the <em>{module.title}</em> training module. Here you’ll learn all the key concepts in detail.</p>
      </section>

      <div className="button-container">
    <button className="mark-complete-btn">Mark as Complete</button>
  </div> 
    </div>
  );
};

export default ModulePage;
