import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";
import { ClipLoader } from "react-spinners"; // For a loading spinner
import { CSVLink } from "react-csv"; // For CSV export

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "asc" }); // Default sorting by timestamp
  const [selectedRows, setSelectedRows] = useState([]); // Row selection state

  // Fetch logs initially
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const index= JSON.parse(localStorage.getItem("selectedProject")).filebeat_index;
        const response = await fetch(
          `https://logboard-1.onrender.com/logs/${index}`
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

  // Sorting functionality
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const matchA = a.match(/\[(.*?)\]\s(.*)/);
    const matchB = b.match(/\[(.*?)\]\s(.*)/);
    const timestampA = matchA ? matchA[1] : "";
    const timestampB = matchB ? matchB[1] : "";
    const messageA = matchA ? matchA[2] : a;
    const messageB = matchB ? matchB[2] : b;

    if (sortConfig.key === "timestamp") {
      return sortConfig.direction === "asc"
        ? timestampA.localeCompare(timestampB)
        : timestampB.localeCompare(timestampA);
    }
    if (sortConfig.key === "message") {
      return sortConfig.direction === "asc"
        ? messageA.localeCompare(messageB)
        : messageB.localeCompare(messageA);
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Row selection functionality
  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  // Export data functionality
  const csvData = sortedLogs
    .filter((_, index) => selectedRows.includes(index))
    .map((log) => {
      const match = log.match(/\[(.*?)\]\s(.*)/);
      return {
        Timestamp: match ? match[1] : "N/A",
        Message: match ? match[2] : log,
      };
    });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>SYSTEM LOGS</h2>

      <input
        type="text"
        placeholder="Filter your data using KQL syntax"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className={styles.searchInput}
      />

      {loading ? (
        <div className={styles.loadingContainer}>
          <ClipLoader color="#4F46E5" size={50} />
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.exportButton}>
            <CSVLink data={csvData} filename={"logs.csv"}>
              Export Selected Rows to CSV
            </CSVLink>
          </div>
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === sortedLogs.length}
                    onChange={() => {
                      if (selectedRows.length === sortedLogs.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(sortedLogs.map((_, index) => index));
                      }
                    }}
                  />
                </th>
                <th onClick={() => requestSort("timestamp")}>
                  Timestamp{" "}
                  <span className={styles.sortIcon}>
                    {sortConfig.key === "timestamp" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲"}
                  </span>
                </th>
                <th onClick={() => requestSort("message")}>
                  Message{" "}
                  {sortConfig.key === "message" && (
                    <span className={styles.sortIcon}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length > 0 ? (
                sortedLogs.map((log, index) => {
                  const match = log.match(/\[(.*?)\]\s(.*)/); // Extract timestamp and message
                  const timestamp = match ? match[1] : "N/A";
                  const message = match ? match[2] : log;
                  return (
                    <tr key={index} className={selectedRows.includes(index) ? styles.selectedRow : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={() => handleRowSelect(index)}
                        />
                      </td>
                      <td>{timestamp}</td>
                      <td>{message}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noLogs}>
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsTable;