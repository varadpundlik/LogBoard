import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css"; // Import the CSS module

const SIDEBAR_ITEMS = [
	{ name: "Overview", icon: BarChart2, color: "#6366f1", href: "/" },
	{ name: "Logs Explorer", icon: ShoppingBag, color: "#8B5CF6", href: "/logs" },
	{ name: "System Metrics", icon: Users, color: "#EC4899", href: "/users" },
	{ name: "Logs summarization", icon: TrendingUp, color: "#3B82F6", href: "/logs-summary" },
	{ name: "Alerts", icon: DollarSign, color: "#10B981", href: "/sales" },
	{ name: "Root Cause Analysis", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
	{ name: "Automation", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<motion.div
			className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
			animate={{ width: isSidebarOpen ? 250 : 80 }}
		>
			<div className={styles.sidebarContainer}>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className={styles.menuButton}
				>
					<Menu size={24} />
				</motion.button>

				<nav className={styles.nav}>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className={styles.navItem}>
								<item.icon size={30} style={{ color: item.color, minWidth: "20px" }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className={styles.navText}
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>
			</div>
		</motion.div>
	);
};

export default Sidebar;
