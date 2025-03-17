import { motion } from "framer-motion";
import styles from "./StatCard.module.css"; // Import CSS module

const StatCard = ({ name, icon: Icon, value, color }) => {
	return (
		<motion.div
			className={styles.statCard}
			whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
		>
			<div className={styles.cardContent}>
				<span className={styles.cardHeader}>
					<Icon size={20} className={styles.cardIcon} style={{ color }} />
					{name}
				</span>
				<p className={styles.cardValue}>{value}</p>
			</div>
		</motion.div>
	);
};

export default StatCard;
