import { useNavigate } from "react-router-dom";
import React from "react";
import styles from "./Login.module.css";
import loginImage from "../assets/Loginpage_image.png";
import axios from "axios";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit =async (e) => {
    e.preventDefault();
    console.log("Login form submitted"); // Debugging: Check if this logs

    const response =await axios.post('https://logboard-1.onrender.com/user/login', {
      email: email,
      password: password
    }).then((response) => {
      console.log(response);
      localStorage.setItem("accessToken", response.data.accessToken);
    }).catch((error) => {
      console.log(error);
    }
    );

    const isLoginSuccessful = true; // Replace with actual login logic

    if (isLoginSuccessful) {
      navigate("/projectlist"); // Redirect to /projectlist
    } else {
      console.error("Login failed"); // Handle login failure
    }
  };
  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <div className={styles.abc}>
      {/* Left Side: Image */}
      <div className={styles.imageSection}>
        <img src={loginImage} alt="Login" className={styles.loginImage} />
      </div>

      {/* Right Side: Login Form */}
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>Welcome Back !</h1>
        <p className={styles.loginSubtitle}>Sign in to continue to Logboard</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className={styles.inputField}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className={styles.inputField}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Sign In
          </button>
        </form>

        <p className={styles.signupText}>
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;