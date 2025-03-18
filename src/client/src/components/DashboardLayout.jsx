import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar"; // Create a TopBar component
import styles from "./DashboardLayout.module.css"; // Create a CSS module for the layout

function DashboardLayout({ children }) {
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <TopBar />

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;