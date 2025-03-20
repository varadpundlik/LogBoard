
import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout"; // Import the DashboardLayout
import Overview from "./pages/Overview";
import LogsPage from "./pages/Logs";
import LogsSummary from "./pages/LogsSummary";
import RootCauseAnalysis from "./pages/RootCause";
import AutomationStatus from "./pages/Automation";
import Metrics from "./pages/Metrics";
import AlertStatus from "./pages/Alert";
import Login from "./pages/Login";
import ProjectList from "./pages/ProjectList"
import Register from "./pages/Register"
import AddProject from "./pages/AddProject";
import styles from "./App.module.css"; // Import CSS module

function App() {
  return (
    <div className={styles.appContainer}>
      {/* Background Overlay */}
      <div className={styles.backgroundOverlay}>
        <div className={styles.gradientOverlay} />
        <div className={styles.blurOverlay} />
      </div>

      <Routes>
        {/* Routes with Dashboard Layout */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Overview />
            </DashboardLayout>
          }
        />
        <Route
          path="/logs"
          element={
            <DashboardLayout>
              <LogsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/logs-summary"
          element={
            <DashboardLayout>
              <LogsSummary />
            </DashboardLayout>
          }
        />
        <Route
          path="/root-cause"
          element={
            <DashboardLayout>
              <RootCauseAnalysis />
            </DashboardLayout>
          }
        />

        <Route
          path="/automation"
          element={
            <DashboardLayout>
              <AutomationStatus />
            </DashboardLayout>
          }
        />

        <Route
          path="/metrics"
          element={
            <DashboardLayout>
              <Metrics />
            </DashboardLayout>
          }
        />


        {/* Route without Dashboard Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/addproject" element={<AddProject />} />
        <Route path="/projectlist" element={<ProjectList />} />


      </Routes>
    </div>
  );
}

export default App;