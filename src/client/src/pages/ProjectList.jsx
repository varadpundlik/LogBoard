import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import styles from "./ProjectList.module.css";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [email, setEmail] = useState("");

  // Fetch projects for the logged-in user
  useEffect(() => {
    // Retrieve the logged-in user's email from localStorage or context
    // const loggedInEmail = localStorage.getItem("loggedInEmail");
    // if (loggedInEmail) {
    //   setEmail(loggedInEmail);
    //   fetchProjects(loggedInEmail);
    // } else {
    //   // Redirect to login if no email is found
    //   navigate("/login");
    // }
    
      fetchProjects("test@gmail.com");
  }, [navigate]);

  // Simulate fetching projects from an API
  const fetchProjects = async (email) => {
    // Replace this with your actual API call
    const mockProjects = [
      { id: 1, name: "Project Alpha", description: "Dashboard for analytics" },
      { id: 2, name: "Project Beta", description: "Logs monitoring system" },
      { id: 3, name: "Project Gamma", description: "Root cause analysis tool" },
    ];
    setProjects(mockProjects);
  };

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    // navigate(`/project/${projectId}`);
    navigate("/");
  };

  // Handle add project
  const handleAddProject = () => {
    navigate("/addproject");
  };

  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.projectsTitle}>Your Projects</h1>
      <p className={styles.projectsSubtitle}>Logged in as: {email}</p>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={styles.projectCard}
            onClick={() => handleProjectSelect(project.id)}
          >
            <h2 className={styles.projectName}>{project.name}</h2>
            <p className={styles.projectDescription}>{project.description}</p>
            <div className={styles.redirectArrow}>
              <ArrowRight className={styles.redirectIcon} />
            </div>
          </div>
        ))}

        {/* Add Project Button */}
        <div className={styles.addProjectCard} onClick={handleAddProject}>
          <span className={styles.addProjectIcon}>+</span>
          <span className={styles.addProjectText}>Add Project</span>
        </div>
      </div>
    </div>
  );
};

export default Projects;