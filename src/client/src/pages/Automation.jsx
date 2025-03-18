import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";

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
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Automation Status</h2>
      {loading && <p className="text-center text-gray-500">Loading automation status...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      {!loading && !error && automationStatus && (
        <div className={styles.tableContainer}>
          <div className={styles.operationBlock}>
            <h3 className="text-xl font-semibold text-black">Latest Status</h3>
            <p className="text-black">{automationStatus.message}</p>
          </div>
        </div>
      )}
      
      <div className={styles.operationBlock}>
        <h3 className="text-xl font-semibold text-black">Previous Incidents</h3>
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
                <td colSpan="3" className="text-center text-gray-500">No previous incidents available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutomationStatus;
