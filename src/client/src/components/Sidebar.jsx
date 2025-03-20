import {
  BarChart2,
  BookText,
  Bug,
  Cpu,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

const iconcolor = "#c4c7db";
const SIDEBAR_ITEMS = [
  { name: "Overview", icon: BarChart2, color: "#7f818d", href: "/" },
  { name: "Logs Explorer", icon: FileText, color: "#7f818d", href: "/logs" },
  { name: "System Metrics", icon: Cpu, color: "#7f818d", href: "/metrics" },
  { name: "Logs Summarization", icon: BookText, color: "#7f818d", href: "/logs-summary" },
  { name: "Alerts", icon: ShieldAlert, color: "#7f818d", href: "/alerts" },
  { name: "Root Cause Analysis", icon: Bug, color: "#7f818d", href: "/root-cause" },
  { name: "Automation", icon: Settings, color: "#7f818d", href: "/automation" },
  { name: "Sign Out", icon: LogOut, color: "#ff8700", href: "/login" }, // Add Sign Out to the list
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle item click
  const handleItemClick = (href) => {
    if (href === "/login") {
      // Handle Sign Out
      navigate("/login");
    } else {
      // Navigate to other routes
      navigate(href);
    }
  };

  return (
    <motion.div
      className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      animate={{ width: isSidebarOpen ? 250 : 80 }}
    >
      <div className={styles.sidebarContainer}>
        {/* Top Section: Project Name and Icon */}
        <motion.div
          className={styles.projectSection}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <LayoutDashboard size={30} style={{ color: "#ff8700", minWidth: "20px" }} />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                className={styles.projectName}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                LOGBOARD
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Items */}
        <nav className={styles.nav}>
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.href}
              onClick={() => handleItemClick(item.href)}
            >
              <motion.div
                className={`${styles.navItem} ${
                  location.pathname === item.href ? styles.active : ""
                }`}
                data-href={item.href} // Add data-href attribute
              >
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
            </div>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;