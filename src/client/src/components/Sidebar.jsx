import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import styles from "./Sidebar.module.css"; // Import the CSS module

const iconcolor = "#c4c7db";
const SIDEBAR_ITEMS = [
  { name: "Overview", icon: BarChart2, color: "#7f818d", href: "/" },
  { name: "Logs Explorer", icon: ShoppingBag, color: "#7f818d", href: "/logs" },
  { name: "System Metrics", icon: Users, color: "#7f818d", href: "/metrics" },
  { name: "Logs summarization", icon: TrendingUp, color: "#7f818d", href: "/logs-summary" },
  { name: "Alerts", icon: DollarSign, color: "#7f818d", href: "/alerts" },
  { name: "Root Cause Analysis", icon: ShoppingCart, color: "#7f818d", href: "/root-cause" },
  { name: "Automation", icon: Settings, color: "#7f818d", href: "/automation" },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation(); // Get the current route path

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
              <motion.div
                className={`${styles.navItem} ${
                  location.pathname === item.href ? styles.active : ""
                }`}
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
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;