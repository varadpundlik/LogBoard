import React, { useEffect, useState } from "react";
import styles from "./Alert.module.css";k
import { ClipLoader } from "react-spinners"; // For a loading spinner

const AlertStatus = () => {
  const [alertMessage, setAlertMessage] = useState("Checking alerts...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAlertStatus = async () => {
      try {
        const response = await fetch("https://logboard-1.onrender.com/logs/.ds-filebeat-8.17.0-2025.02.09-000002/alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch alert status");

        const data = await response.json();
        setAlertMessage(data.message);
      } catch (err) {
        setError(err.message);
        setAlertMessage("Error fetching alert status");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertStatus();
    const interval = setInterval(fetchAlertStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const previousAlerts = [
    { timestamp: "2025-03-16T12:00:00Z", status: "Failure detected", action: "Mail Sent" },
    { timestamp: "2025-03-17T14:30:00Z", status: "No failure", action: "None" },
    { timestamp: "2025-03-18T09:15:00Z", status: "Failure detected", action: "Mail Sent" }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ALERT STATUS</h2>

      {loading ? (
        <div className={styles.loadingContainer}>
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <p className={styles.alertMessage}>{alertMessage}</p>
      )}

      {/* Previous Alerts Section */}
      <div className={styles.operationCard}>
        <h3 className={styles.operationTitle}>Previous Alerts</h3>
        <table className={styles.logsTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>

            {previousAlerts.length > 0 ? (
              previousAlerts.map((alert, index) => (
                <tr key={index}>
                  <td>{alert.timestamp}</td>
                  <td>{alert.status}</td>
                  <td>{alert.action}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={styles.noLogsMessage}>No previous alerts available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertStatus;