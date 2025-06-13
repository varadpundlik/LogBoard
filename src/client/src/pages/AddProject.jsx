import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddProject.module.css";
import axios from "axios";

const AddProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    owner_email: "",
    accessible_to_emails: [], // Store emails as an array
    deployment_ip: "",
    filebeat_index: "",
    metricbeat_index: "",
  });
  const [emailInput, setEmailInput] = useState(""); // Temporary input for email
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.description ||
      !formData.owner_email ||
      formData.accessible_to_emails.length === 0 || // Ensure at least one email is added
      !formData.deployment_ip ||
      !formData.filebeat_index ||
      !formData.metricbeat_index
    ) {
      setError("All fields are required");
      return;
    }
    axios.post('http://localhost:6000/project/addProject', {
      name: formData.name,
      description: formData.description,
      owner_email: formData.owner_email,
      accessible_to_emails: formData.accessible_to_emails,
      deployment_ip: formData.deployment_ip,
      filebeat_index: formData.filebeat_index,
      metricbeat_index: formData.metricbeat_index
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    }
    );
    console.log("Project form submitted:", formData);

    // Add your project creation logic here (e.g., API call)
    const isProjectCreated = true; // Replace with actual logic

    if (isProjectCreated) {
      navigate("/projectlist"); // Redirect to project list after successful creation
    } else {
      console.error("Project creation failed"); // Handle creation failure
    }
  };

  // Handle input changes for non-email fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding an email
  const handleAddEmail = () => {
    if (emailInput && !formData.accessible_to_emails.includes(emailInput)) {
      setFormData({
        ...formData,
        accessible_to_emails: [...formData.accessible_to_emails, emailInput],
      });
      setEmailInput(""); // Clear the input field
    }
  };

  // Handle removing an email
  const handleRemoveEmail = (email) => {
    setFormData({
      ...formData,
      accessible_to_emails: formData.accessible_to_emails.filter((e) => e !== email),
    });
  };

  return (
    <div className={styles.addProjectContainer}>
      <h1 className={styles.addProjectTitle}>ADD NEW PROJECT</h1>

      {/* Display error message if any */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.addProjectForm}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Name Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.inputLabel}>
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter project name"
              className={styles.inputField}
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.inputLabel}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter project description"
              className={styles.inputField}
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          {/* Owner Email Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="owner_email" className={styles.inputLabel}>
              Owner Email
            </label>
            <input
              type="email"
              id="owner_email"
              name="owner_email"
              placeholder="Enter owner's email"
              className={styles.inputField}
              value={formData.owner_email}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Accessible To Emails Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="accessible_to_emails" className={styles.inputLabel}>
              Accessible To Emails
            </label>
            <div className={styles.emailInputContainer}>
              <input
                type="email"
                id="accessible_to_emails"
                placeholder="Enter email and press 'Add'"
                className={styles.inputField}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <button
                type="button"
                className={styles.addEmailButton}
                onClick={handleAddEmail}
              >
                Add
              </button>
            </div>
            {/* Display added emails as tags */}
            <div className={styles.emailTags}>
              {formData.accessible_to_emails.map((email) => (
                <div key={email} className={styles.emailTag}>
                  {email}
                  <button
                    type="button"
                    className={styles.removeEmailButton}
                    onClick={() => handleRemoveEmail(email)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          
          {/* Deployment IP Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="deployment_ip" className={styles.inputLabel}>
              Deployment IP
            </label>
            <input
              type="text"
              id="deployment_ip"
              name="deployment_ip"
              placeholder="Enter deployment IP"
              className={styles.inputField}
              value={formData.deployment_ip}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Filebeat Index Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="filebeat_index" className={styles.inputLabel}>
              Filebeat Index
            </label>
            <input
              type="text"
              id="filebeat_index"
              name="filebeat_index"
              placeholder="Enter Filebeat index"
              className={styles.inputField}
              value={formData.filebeat_index}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Metricbeat Index Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="metricbeat_index" className={styles.inputLabel}>
              Metricbeat Index
            </label>
            <input
              type="text"
              id="metricbeat_index"
              name="metricbeat_index"
              placeholder="Enter Metricbeat index"
              className={styles.inputField}
              value={formData.metricbeat_index}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <button type="submit" className={styles.submitButton}>
                Add Project
            </button>
          </div>
          
        </div>

        {/* Submit Button */}
        
      </form>
    </div>
  );
};

export default AddProject;