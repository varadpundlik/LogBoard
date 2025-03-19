import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";

const RootCauseAnalysis = () => {
  const [rootCause, setRootCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRCA = async () => {
      try {
        const response = await fetch("https://logboard-1.onrender.com/rca");
        // const response = await fetch("http://localhost:5000/rca");
        if (!response.ok) throw new Error("Failed to fetch RCA data");
        const data = await response.json();
        setRootCause(data);
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
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Root Cause Analysis</h2>
      {loading && <p className="text-center text-gray-500">Loading RCA data...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && rootCause && (
        <div className={styles.tableContainer}>
          <div className={styles.operationBlock}>
            <h3 className="text-xl font-semibold text-black">Root Cause</h3>
            <p className="text-black">{rootCause.root_cause}</p>
          </div>

          <div className={styles.operationBlock}>
            <h3 className="text-xl font-semibold text-black">Evidence</h3>
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {rootCause.evidence.length > 0 ? (
                  rootCause.evidence.map((log, index) => {
                    const [timestamp, ...messageParts] = log.split(" ");
                    const message = messageParts.join(" ");
                    return (
                      <tr key={index}>
                        <td>{timestamp.replace("[", "").replace("]", "")}</td>
                        <td>{message}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center text-gray-500">No evidence available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.operationBlock}>
            <h3 className="text-xl font-semibold text-black">Recommendation</h3>
            <p className="text-black">{rootCause.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCauseAnalysis;