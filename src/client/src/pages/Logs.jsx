import React, { useEffect, useState } from "react";
import styles from "./Logs.module.css";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5; // Show 5 logs per page

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("https://logboard-1.onrender.com/logs/.ds-filebeat-8.17.0-2025.02.09-000002");
        if (!response.ok) throw new Error("Failed to fetch logs");

        const data = await response.json();
        setLogs(data);
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

  // Ensure at least one page is available
  const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

  // Keep currentPage within valid bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [logs, totalPages]);

  useEffect(() => {
    console.log("Page changed:", currentPage);
  }, [currentPage]);
  

  // Get logs for current page
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">System Logs</h2>

      {loading && <p className="text-center text-gray-500">Loading logs...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => {
                  const [timestamp, ...messageParts] = log.split(" - ");
                  const message = messageParts.join(" - ");
                  return (
                    <tr key={index}>
                      <td>{timestamp}</td>
                      <td>{message}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-gray-500">
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {logs.length > 0 && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogsTable;
