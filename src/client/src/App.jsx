// import { Route, Routes } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import Overview from "./pages/Overview";
// import LogsPage from "./pages/Logs";
// import Login from "./pages/Login"
// import styles from "./App.module.css"; 

// function App() {
// 	return (
// 		<div className={styles.appContainer}>
		
// 			<div className={styles.backgroundOverlay}>
// 				<div className={styles.gradientOverlay} />
// 				<div className={styles.blurOverlay} />
// 			</div>

// 			<Sidebar />

// 			<Routes>
// 				<Route path='/' element={<Overview />} />
// 				<Route path='/logs' element={<LogsPage />} />
// 				<Route path='/login' element={<Login />} />
		
// 			</Routes>
// 		</div>
// 	);
// }

// export default App;

import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout"; // Import the DashboardLayout
import Overview from "./pages/Overview";
import LogsPage from "./pages/Logs";
import LogsSummary from "./pages/LogsSummary";
import RootCauseAnalysis from "./pages/RootCause";
import AutomationStatus from "./pages/Automation";
import Login from "./pages/login";
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

        {/* Route without Dashboard Layout */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;