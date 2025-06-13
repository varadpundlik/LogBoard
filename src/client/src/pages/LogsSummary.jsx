import React, { useEffect, useState } from "react";
import styles from "./LogsSummary.module.css";
import { ClipLoader } from "react-spinners";

const LogsTable = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const index = JSON.parse(localStorage.getItem("selectedProject")).filebeat_index;
        console.log(index);
        const response = await fetch(`http://localhost:5000/logs/summarize/${index}`);
        // const response = await fetch("http://localhost:5000/logs/summarize");
        if (!response.ok) throw new Error("Failed to fetch logs");
        const data = await response.json();
        setOperations(data.operations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>LOGS SUMMARIZATION</h2>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      ) : operations.length > 0 ? (
        <div>
          {operations.map((operation, index) => (
            <div key={index} className={styles.operationCard}>
              <h3 className={styles.operationTitle}>{operation.operation}</h3>
              <p className={styles.operationSummary}>{operation.summary}</p>
              <table className={styles.logsTable}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {operation.logs.length > 0 ? (
                    operation.logs.map((log, logIndex) => {
                      const [timestamp, ...messageParts] = log.split(" ");
                      const message = messageParts.join(" ");
                      return (
                        <tr key={logIndex}>
                          <td>{timestamp.replace("[", "").replace("]", "")}</td>
                          <td>{message}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="2" className={styles.noLogsMessage}>No logs available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noLogsMessage}>No logs available</p>
      )}
    </div>
  );
};

export default LogsTable;