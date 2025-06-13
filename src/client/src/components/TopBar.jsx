import React, { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react"; // Import icons
import styles from "./TopBar.module.css";
import {useNavigate} from "react-router-dom";

function TopBar() {
  const [selectedProject, setSelectedProject] = useState(
    JSON.parse(localStorage.getItem("selectedProject"))?.name || "New Project"
  );
  const [projects, setProjects] = useState([]); // List of projects
  const [projectObject, setProjectObject] = useState([]); // List of projects
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
  const navigate = useNavigate();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/project/getProject");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        const projectNames = data.map((project) => project.name);
        setProjectObject(data);
        setProjects(projectNames);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Handle project selection
  const handleProjectSelect = (project) => {
    console.log("Selected project:", JSON.stringify(project));
    setSelectedProject(project.name);
    localStorage.setItem("selectedProject", JSON.stringify(project)); // Save selection to localStorage
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleAddProject = () => {
    // Add project logic here
    navigate("/addproject");
    console.log("Add project clicked");
  }

  return (
    <div className={styles.topBar}>
      {/* Left: Selected Project Name */}
      <div className={styles.leftSection}>
        <h1>{selectedProject}</h1>
      </div>

      {/* Right: Dropdown and Add Project Button */}
      <div className={styles.rightSection}>
        {/* Dropdown for Switching Projects */}
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Switch Project <ChevronDown size={16} className={styles.dropdownIcon} />
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownContent}>
              {projects.map((project) => (
                <div
                  key={project}
                  className={styles.dropdownItem}
                  onClick={() => handleProjectSelect(projectObject.find((p) => p.name === project))}
                >
                  {project}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Project Button */}
        <button className={styles.addProjectButton} onClick={handleAddProject}>
          <Plus size={16} className={styles.addIcon} /> Add Project
        </button>
      </div>
    </div>
  );
}

export default TopBar;
