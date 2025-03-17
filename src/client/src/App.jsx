import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import LogsPage from "./pages/Logs";
import styles from "./App.module.css"; // Import CSS module

function App() {
	return (
		<div className={styles.appContainer}>
			{/* Background Overlay */}
			<div className={styles.backgroundOverlay}>
				<div className={styles.gradientOverlay} />
				<div className={styles.blurOverlay} />
			</div>

			<Sidebar />

			<Routes>
				<Route path='/' element={<OverviewPage />} />
				<Route path='/logs' element={<LogsPage />} />
					{/* <Route path='/users' element={<UsersPage />} />
				<Route path='/sales' element={<SalesPage />} />
				<Route path='/orders' element={<OrdersPage />} />
				<Route path='/analytics' element={<AnalyticsPage />} />
				<Route path='/settings' element={<SettingsPage />} /> */}
			</Routes>
		</div>
	);
}

export default App;
