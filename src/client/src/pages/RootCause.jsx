import React, { useEffect, useState } from "react";
import styles from "./RootCauseAnalysis.module.css";
import { ClipLoader } from "react-spinners"; // For a loading spinner

const RootCauseAnalysis = () => {
  const [rootCauses, setRootCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRCA = async () => {
      try {
        const index = JSON.parse(localStorage.getItem("selectedProject")).filebeat_index;
        const response = await fetch(`https://logboard-1.onrender.com/rca/${index}`);
        if (!response.ok) throw new Error("Failed to fetch RCA data");
        const data = await response.json();
        setRootCauses(data.root_causes || []); // Ensure it's always an array
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRCA();
    const interval = setInterval(fetchRCA, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ROOT CAUSE ANALYSIS</h2>

      {loading ? (
        <div className={styles.loadingContainer}>
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      ) : rootCauses.length > 0 ? (
        rootCauses.map((rootCause, index) => (
          <div key={index} className={styles.contentContainer}>
            {/* Root Cause Section */}
            <div className={styles.operationCard}>
              <h3 className={styles.operationTitle}>Root Cause {index + 1}</h3>
              <p className={styles.operationSummary}>{rootCause.root_cause}</p>
            </div>
            <div className={styles.operationCard}>
              <h3 className={styles.operationTitle}>Status: </h3>
              <p className={styles.operationSummary}>{rootCause.status}</p>
            </div>

            {/* Evidence Section */}
            <div className={styles.operationCard}>
              <h3 className={styles.operationTitle}>Evidence</h3>
              <table className={styles.logsTable}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {rootCause.evidence.length > 0 ? (
                    rootCause.evidence.map((log, logIndex) => {
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
                      <td colSpan="2" className={styles.noLogsMessage}>No evidence available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recommendation Section */}
            <div className={styles.operationCard}>
              <h3 className={styles.operationTitle}>Recommendation</h3>
              <p className={styles.operationSummary}>{rootCause.recommendation}</p>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noLogsMessage}>No RCA data available</p>
      )}
    </div>
  );
};

export default RootCauseAnalysis;
