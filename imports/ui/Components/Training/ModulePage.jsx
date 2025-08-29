import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const trainingModules = [
  { id: "1", title: "Food Safety Basics", description: "Learn essential food safety practices.", duration: "30 min", createdAt:"2024-01-15T10:00:00" },
  { id: "2", title: "Customer Service", description: "Best practices for customer interactions.", duration: "45 min", createdAt: "2024-01-15T10:00:00" },
  { id: "3", title: "POS System Training", description: "How to use the Point of Sale system.", duration: "20 min", createdAt: "2024-01-15T10:00:00" },
  { id: "4", title: "Kitchen Operations", description: "Overview of kitchen workflows.", duration: "40 min", createdAt: "2024-01-15T10:00:00" },
  { id: "5", title: "Kitchen Cleaning", description: "Best practices for kitchen cleaning techniques.", duration: "40 min", createdAt: "2024-01-15T10:00:00"}
]

const ModulePage = () => {
  const { id } = useParams();
  const module = trainingModules.find((m) => m.id === id);

  useEffect(() => {
    if (module) {
      document.title = module.title;
    } else {
      document.title = "Module Not Found";
    }
  }, [module]);

  if (!module) return <div style={{ padding: "20px" }}>Module not found.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{module.title}</h1>  

      <p><strong>Description:</strong> {module.description}</p>
      <p><strong>Duration:</strong> {module.duration}</p>
      <p><strong>Created At:</strong> {new Date(module.createdAt).toLocaleString()}</p>

      <h2>Training Content</h2>
      <p>Welcome to the <em>{module.title}</em> training module. Here you’ll learn all the key concepts.</p>

      <button style={{ marginTop: "20px", padding: "10px 20px" }}>
        Mark as Complete
      </button>
    </div>
  );
};

export default ModulePage;
