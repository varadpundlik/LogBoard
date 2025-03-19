import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";

const LogsTable = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("https://logboard-1.onrender.com/logs/summarize");
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
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2  text-center">System Logs</h2>
      {loading && <p className="text-center text-gray-500">Loading logs...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && operations.length > 0 ? (
        <div className={styles.tableContainer}>
          {operations.map((operation, index) => (
            <div key={index} className={styles.operationBlock}>
              <h3 className="text-xl font-semibold text-black">{operation.operation}</h3>
              <p className="text-black">{operation.summary}</p>
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
                      <td colSpan="2" className="text-center text-gray-500">No logs available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No logs available</p>
      )}
    </div>
  );
};

export default LogsTable;