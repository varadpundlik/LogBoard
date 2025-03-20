import React, { useEffect, useState } from "react";
import styles from "./Automation.module.css";
import { ClipLoader } from "react-spinners"; // For a loading spinner

const AutomationStatus = () => {
  const [automationStatus, setAutomationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAutomationStatus = async () => {
      try {
        const response = await fetch("https://logboard-1.onrender.com/automation");
        if (!response.ok) throw new Error("Failed to fetch automation status");
        const data = await response.json();
        setAutomationStatus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomationStatus();
    const interval = setInterval(fetchAutomationStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sample hardcoded previous incidents
  const previousIncidents = [
    { timestamp: "2025-03-15T12:30:45Z", failure: "Crash", job: "RestartServer" },
    { timestamp: "2025-03-14T08:15:22Z", failure: "Memory Leak", job: "ScaleUpInstance" },
    { timestamp: "2025-03-13T18:05:10Z", failure: "Database Connection Error", job: "RestartDatabase" }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>AUTOMATION STATUS</h2>
      {loading ? (
        <div className={styles.loadingContainer}>
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      ) : automationStatus ? (
        <div className={styles.contentContainer}>
          {/* Latest Status Section */}
          <div className={styles.operationCard}>
            <h3 className={styles.operationTitle}>Latest Status</h3>
            <p className={styles.operationSummary}>{automationStatus.message}</p>
          </div>
        </div>
      ) : (
        <p className={styles.noLogsMessage}>No automation status available</p>
      )}
     
      {/* Previous Incidents Section */}
      <div className={styles.operationCard}>
        <h3 className={styles.operationTitle}>Previous Incidents</h3>
        <table className={styles.logsTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Failure</th>
              <th>Triggered Job</th>
            </tr>
          </thead>
          <tbody>
            {previousIncidents.length > 0 ? (
              previousIncidents.map((incident, index) => (
                <tr key={index}>
                  <td>{incident.timestamp}</td>
                  <td>{incident.failure}</td>
                  <td>{incident.job}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={styles.noLogsMessage}>No previous incidents available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutomationStatus;