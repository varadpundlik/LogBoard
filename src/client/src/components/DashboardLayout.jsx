import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar"; // Create a TopBar component
import styles from "./DashboardLayout.module.css"; // Create a CSS module for the layout

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        {/* Top Bar */}
        <TopBar />

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;