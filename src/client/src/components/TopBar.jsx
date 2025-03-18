import React from "react";
import styles from "./TopBar.module.css"; // Create a CSS module for the top bar

function TopBar() {
  return (
    <div className={styles.topBar}>
      <h1>Project Name</h1>
    </div>
  );
}

export default TopBar;