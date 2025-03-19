import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch logs initially
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(
          "https://logboard-1.onrender.com/logs/.ds-filebeat-8.17.0-2025.02.09-000002"
          // "http://localhost:5000/logs/.ds-filebeat-8.17.1-2025.02.04-000001"
        );
        if (!response.ok) throw new Error("Failed to fetch logs");

        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data); // Initially, filteredLogs = logs
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh logs every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle search input and send API request
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // If the search query is empty, reset to the original logs
      setFilteredLogs(logs);
      return;
    }

    try {
      // Send the search query to the backend API
      const response = await fetch(
        "https://logboard-1.onrender.com/logs/.ds-filebeat-8.17.0-2025.02.09-000002/search",
        // "http://localhost:5000/logs/.ds-filebeat-8.17.1-2025.02.04-000001/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }), // Send the search query in the request body
        }
      );

      if (!response.ok) throw new Error("Failed to filter logs");

      const data = await response.json();
      setFilteredLogs(data); // Update filtered logs with the response from the backend
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Logs</h2>

      <input
        type="text"
        placeholder="Filter your data using KQL syntax"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className={styles.searchInput}
      />

      {loading && <p className={styles.loading}>Loading logs...</p>}
      {error && <p className={styles.error}>Error: {error}</p>}

      {!loading && !error && (
        <div className={styles.tableContainer}>
          <div className={styles.scrollableTable}>
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => {
                    const match = log.match(/\[(.*?)\]\s(.*)/); // Extract timestamp and message
                    const timestamp = match ? match[1] : "N/A";
                    const message = match ? match[2] : log;
                    return (
                      <tr key={index}>
                        <td>{timestamp}</td>
                        <td>{message}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="2" className={styles.noLogs}>
                      No logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTable;