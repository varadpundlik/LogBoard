import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import styles from "./Metrics.module.css";
import { ClipLoader } from "react-spinners"; // Import the loading spinner

// Register all chart components
ChartJS.register(...registerables);

const Metrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facts, setFacts] = useState({});
  const [chartLoading, setChartLoading] = useState(true); // Loading state for charts

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const index= JSON.parse(localStorage.getItem("selectedProject")).metricbeat_index;
            const response = await fetch(
          `https://logboard-1.onrender.com/metrics/${index}`
        );
        // const response = await fetch(
        //   "https://logboard-1.onrender.com/metrics/.ds-metricbeat-8.17.1-2025.02.06-000001"
        // );
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        console.log("API Response:", data); // Log the API response
        setMetrics(data);

        // Calculate interesting facts
        const calculatedFacts = calculateFacts(data);
        setFacts(calculatedFacts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setChartLoading(false); // Charts are ready to render
      }
    };

    fetchMetrics();
  }, []);

  const calculateFacts = (data) => {
    const cpuUsage = data.cpu.map((item) => item.value);
    const memoryUsage = data.memory.map((item) => item.value);
    const diskioRead = data.diskio.map((item) => item.read_bytes);
    const diskioWrite = data.diskio.map((item) => item.write_bytes);
    const networkIn = data.network.map((item) => item.in_bytes);
    const networkOut = data.network.map((item) => item.out_bytes);

    return {
      cpu: {
        average: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
        peak: Math.max(...cpuUsage),
        bottleneck: Math.max(...cpuUsage) > 90,
      },
      memory: {
        utilization: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
        pressure: Math.min(...memoryUsage) < 10,
      },
      diskio: {
        readWriteRatio: diskioRead.reduce((a, b) => a + b, 0) / diskioWrite.reduce((a, b) => a + b, 1),
        utilization: diskioRead.reduce((a, b) => a + b, 0) + diskioWrite.reduce((a, b) => a + b, 0),
      },
      network: {
        inOutRatio: networkIn.reduce((a, b) => a + b, 0) / networkOut.reduce((a, b) => a + b, 1),
        errors: data.network.reduce((sum, item) => sum + item.in_errors + item.out_errors, 0),
      },
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ClipLoader color="#4F46E5" size={50} /> {/* Loading spinner */}
      </div>
    );
  }
  if (error) {
    return <div className={styles.errorMessage}>Error: {error}</div>;
  }
  if (!metrics || !metrics.diskio || !metrics.network) {
    return <div className={styles.container}>No data available for Disk I/O or Network.</div>;
  }

  const chartOptions = {
    animation: false, // Disable animations
    plugins: {
      decimation: {
        enabled: true,
        algorithm: "min-max", // Reduce data points
      },
    },
  };

  const cpuData = {
    labels: metrics.cpu.map((item) => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "CPU Usage",
        data: metrics.cpu.map((item) => item.value),
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.1,
        pointRadius: 1, // Reduce point radius
      },
    ],
  };

  const memoryData = {
    labels: metrics.memory.map((item) => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Memory Usage",
        data: metrics.memory.map((item) => item.value),
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
        borderWidth: 1,
      },
    ],
  };

  const diskioData = {
    labels: metrics.diskio.map((item) => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Disk Read (Bytes)",
        data: metrics.diskio.map((item) => item.read_bytes),
        borderColor: "#FF9800",
        fill: false,
        tension: 0.1,
        pointRadius: 1, // Reduce point radius
      },
      {
        label: "Disk Write (Bytes)",
        data: metrics.diskio.map((item) => item.write_bytes),
        borderColor: "#FF5722",
        fill: false,
        tension: 0.1,
        pointRadius: 1, // Reduce point radius
      },
    ],
  };

  const networkData = {
    labels: metrics.network.map((item) => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Network In (Bytes)",
        data: metrics.network.map((item) => item.in_bytes),
        backgroundColor: "#9C27B0",
        borderColor: "#9C27B0",
        borderWidth: 1,
      },
      {
        label: "Network Out (Bytes)",
        data: metrics.network.map((item) => item.out_bytes),
        backgroundColor: "#673AB7",
        borderColor: "#673AB7",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>SYSTEM METRICS</h2>

      {/* Interesting Facts Section */}
      <div className={styles.factsContainer}>
        <div className={styles.card}>
          <div className={styles.box}>
            <div className={styles.content}>
              <h3>CPU Analytics</h3>
              <p>Average Usage: {facts.cpu?.average?.toFixed(2)}%</p>
              <p>Peak Usage: {facts.cpu?.peak?.toFixed(2)}%</p>
              <p>Bottleneck: {facts.cpu?.bottleneck ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.box}>
            <div className={styles.content}>
              <h3>Memory Analytics</h3>
              <p>Utilization: {facts.memory?.utilization?.toFixed(2)}%</p>
              <p>Pressure: {facts.memory?.pressure ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.box}>
            <div className={styles.content}>
              <h3>Disk I/O Analytics</h3>
              <p>Read/Write Ratio: {facts.diskio?.readWriteRatio?.toFixed(2)}</p>
              <p>Total Utilization: {facts.diskio?.utilization?.toFixed(2)} bytes</p>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.box}>
            <div className={styles.content}>
              <h3>Network Analytics</h3>
              <p>In/Out Ratio: {facts.network?.inOutRatio?.toFixed(2)}</p>
              <p>Total Errors: {facts.network?.errors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className={styles.dashboard}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>CPU Usage</h3>
          <div className={styles.chartContainer}>
            {chartLoading ? (
              <div className={styles.chartLoading}>
                <ClipLoader color="#4F46E5" size={30} /> {/* Loading spinner */}
              </div>
            ) : (
              <Line data={cpuData} options={chartOptions} />
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Memory Usage</h3>
          <div className={styles.chartContainer}>
            {chartLoading ? (
              <div className={styles.chartLoading}>
                <ClipLoader color="#4F46E5" size={30} /> {/* Loading spinner */}
              </div>
            ) : (
              <Bar data={memoryData} options={chartOptions} />
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Network Throughput</h3>
          <div className={styles.chartContainer}>
            {chartLoading ? (
              <div className={styles.chartLoading}>
                <ClipLoader color="#4F46E5" size={30} /> {/* Loading spinner */}
              </div>
            ) : (
              <Bar data={networkData} options={chartOptions} />
            )}
          </div>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Disk I/O</h3>
          <div className={styles.chartContainer}>
            {chartLoading ? (
              <div className={styles.chartLoading}>
                <ClipLoader color="#4F46E5" size={30} /> {/* Loading spinner */}
              </div>
            ) : (
              <Line data={diskioData} options={chartOptions} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Metrics;