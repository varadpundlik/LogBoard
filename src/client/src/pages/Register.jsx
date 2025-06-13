import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css"; // Use the same styles as Login
import loginImage from "../assets/Loginpage_image.png"; // Use the same image as Login
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:6000/user/register",
        {
          email,
          password,
          username,
        }
      );
      console.log("Registration successful:", response.data);
      navigate("/login"); // Redirect to login after successful registration
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Registration failed");
    }
  

    // Add your registration logic here (e.g., API call, validation)
    const isRegistrationSuccessful = true; // Replace with actual logic

    if (isRegistrationSuccessful) {
      navigate("/login"); // Redirect to login after successful registration
    } else {
      console.error("Registration failed"); // Handle registration failure
    }
  };

  return (
    <div className={styles.abc}>
      {/* Left Side: Image */}
      <div className={styles.imageSection}>
        <img src={loginImage} alt="Register" className={styles.loginImage} />
      </div>

      {/* Right Side: Register Form */}
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>Create an Account</h1>
        <p className={styles.loginSubtitle}>Sign up to continue to Logboard</p>

        {/* Display error message if passwords don't match */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Email Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={styles.inputField}
              required
            />
          </div>

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.inputLabel}>
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className={styles.inputField}
              required
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className={styles.inputField}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Sign Up Button */}
          <button type="submit" className={styles.loginButton}>
            Sign Up
          </button>
        </form>

        <p className={styles.signupText}>
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;