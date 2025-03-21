// components/Overview/Overview.jsx
import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Overview.module.css';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Overview = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chart options for dark theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#e5e7eb' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#e5e7eb' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const selectedProject = JSON.parse(localStorage.getItem("selectedProject"));
		const [logsRes, metricsRes] = await Promise.all([
			fetch(`https://logboard-1.onrender.com/logs/${selectedProject.filebeat_index}`),
			fetch(`https://logboard-1.onrender.com/metrics/${selectedProject.metricbeat_index}`)
		  ]);
        // const [logsRes, metricsRes] = await Promise.all([
        //   fetch(`http://localhost:5000/logs/${selectedProject.filebeat_index}`),
        //   fetch(`http://localhost:5000/metrics/${selectedProject.metricbeat_index}`)
        // ]);

        const logsData = logsRes.ok ? await logsRes.json() : [];
        const metricsData = metricsRes.ok ? await metricsRes.json() : {
          cpu: [], memory: [], diskio: [], network: []
        };

        setLogs(logsData);
        setMetrics(metricsData);
        setLoading(false);
      } catch (err) {
        setLogs([]);
        setMetrics({ cpu: [], memory: [], diskio: [], network: [] });
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Helper functions
  const getServerStatus = () => {
    if (logs.length === 0) return 'offline';
    const latestLog = logs[0];
    const logTime = new Date(latestLog.split(']')[0].replace('[', ''));
    return (Date.now() - logTime) < 300000 ? 'online' : 'offline';
  };

  const getTodaysLogCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(log => log.startsWith(`[${today}`)).length;
  };

  const getErrorWarningCounts = () => {
    const errors = logs.filter(log => log.includes('ERROR')).length;
    const warnings = logs.filter(log => log.includes('WARN')).length;
    return { errors, warnings };
  };

  const parseLogs = () => {
    return logs.map(log => {
      const [timestamp, message] = log.split('] - ');
      return {
        time: timestamp?.replace('[', '').trim() || 'N/A',
        message: message?.trim() || 'Unable to parse log',
        type: message?.match(/\b(ERROR|WARN|INFO)\b/)?.[0]?.toLowerCase() || 'info'
      };
    });
  };

  // Chart data configurations
  const logsOverTimeData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
    datasets: [{
      label: 'Logs per Hour',
      data: Array.from({ length: 24 }, (_, hour) =>
        parseLogs().filter(log => 
          new Date(log.time).getHours() === hour
        ).length
      ),
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129, 140, 248, 0.2)',
      tension: 0.1,
      fill: true
    }]
  };

  const errorDistributionData = {
    labels: ['Errors', 'Warnings', 'Info'],
    datasets: [{
      data: [
        getErrorWarningCounts().errors,
        getErrorWarningCounts().warnings,
        logs.length - getErrorWarningCounts().errors - getErrorWarningCounts().warnings
      ],
      backgroundColor: ['#dc2626', '#f59e0b', '#4f46e5']
    }]
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.summaryGrid}>
        {/* Server Status Card */}
        <div className={`${styles.metricCard} ${styles[getServerStatus()]}`}>
          <div className={styles.statusContainer}>
            <div className={styles.statusIndicator}></div>
            <h3>Server Status</h3>
          </div>
          <div className={styles.metricValue}>
            {getServerStatus().toUpperCase()}
          </div>
        </div>

        {/* Today's Logs Card */}
        <div className={`${styles.metricCard} ${styles.logsCard}`}>
          <h3>Today's Logs</h3>
          <div className={styles.metricValue}>{getTodaysLogCount()}</div>
          <div className={styles.secondaryText}>
            Last hour: {logs.filter(log => 
              new Date(log.split(']')[0].replace('[', '')).getHours() === new Date().getHours()
            ).length}
          </div>
        </div>

        {/* Errors & Warnings Card */}
        <div className={`${styles.metricCard} ${styles.errorsCard}`}>
          <h3>Errors & Warnings</h3>
          <div className={styles.errorStats}>
            <div className={styles.errorType}>
              <span className={styles.errorDot}></span>
              Errors: {getErrorWarningCounts().errors}
            </div>
            <div className={styles.warningType}>
              <span className={styles.warningDot}></span>
              Warnings: {getErrorWarningCounts().warnings}
            </div>
          </div>
        </div>

        {/* System Metrics Cards */}
        <div className={`${styles.metricCard} ${styles.cpuCard}`}>
          <h3>CPU Usage</h3>
          <div className={styles.metricValue}>
            {metrics?.cpu[0]?.value?.toFixed(1) || 0}%
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.memoryCard}`}>
          <h3>Memory Usage</h3>
          <div className={styles.metricValue}>
            {metrics?.memory[0]?.value?.toFixed(1) || 0}%
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.diskCard}`}>
          <h3>Disk I/O</h3>
          <div className={styles.diskMetrics}>
            <div>Read: {((metrics?.diskio[0]?.read_bytes || 0) / 1e9).toFixed(2)} GB</div>
            <div>Write: {((metrics?.diskio[0]?.write_bytes || 0) / 1e9).toFixed(2)} GB</div>
          </div>
        </div>

        <div className={`${styles.metricCard} ${styles.networkCard}`}>
          <h3>Network</h3>
          <div className={styles.networkMetrics}>
            <div>In: {((metrics?.network[0]?.in_bytes || 0) / 1e6).toFixed(2)} MB</div>
            <div>Out: {((metrics?.network[0]?.out_bytes || 0) / 1e6).toFixed(2)} MB</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <h3>Logs Over Time</h3>
          <div className={styles.chart}>
            <Line data={logsOverTimeData} options={chartOptions} />
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <h3>Error Distribution</h3>
          <div className={styles.chart}>
            <Bar data={errorDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className={styles.logsContainer}>
        <h3>Recent Logs</h3>
        <div className={styles.logsList}>
          {parseLogs().slice(0, 20).map((log, index) => (
            <div key={index} className={`${styles.logEntry} ${styles[log.type]}`}>
              <div className={styles.logTime}>{log.time}</div>
              <div className={styles.logMessage}>{log.message}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className={styles.logEntry}>
              <div className={styles.logMessage}>No logs available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;