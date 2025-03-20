import React, { useState } from "react";
import { ChevronDown, Plus } from "lucide-react"; // Import icons
import styles from "./TopBar.module.css";

function TopBar() {
  const [selectedProject, setSelectedProject] = useState("Project Alpha"); // Default selected project
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state

  // Mock projects data
  const projects = ["Project Alpha", "Project Beta", "Project Gamma"];

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

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
            Switch Project <ChevronDown size={16} className={styles.dropdownIcon} /> {/* Dropdown icon */}
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownContent}>
              {projects.map((project) => (
                <div
                  key={project}
                  className={styles.dropdownItem}
                  onClick={() => handleProjectSelect(project)}
                >
                  {project}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Project Button */}
        <button className={styles.addProjectButton}>
          <Plus size={16} className={styles.addIcon} /> {/* Add icon */}
          Add Project
        </button>
      </div>
    </div>
  );
}

export default TopBar;