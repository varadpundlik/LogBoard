import React, { useEffect, useState } from "react";
import styles from "./Alert.module.css";

const AlertStatus = () => {
  const [alertMessage, setAlertMessage] = useState("Checking alerts...");

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
        setAlertMessage("Error fetching alert status");
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
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Alert Status</h2>
      <p className="text-center text-gray-700 font-semibold">{alertMessage}</p>
      <div className={styles.tableContainer}>
        <h3 className="text-xl font-semibold mt-4">Previous Alerts</h3>
        <table className={styles.logsTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {previousAlerts.map((alert, index) => (
              <tr key={index}>
                <td>{alert.timestamp}</td>
                <td>{alert.status}</td>
                <td>{alert.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertStatus;