// src/components/ScoreMeter.jsx
import { motion } from 'framer-motion'
import { PASS_THRESHOLD } from '../data/levels'
import styles from './ScoreMeter.module.css'

export default function ScoreMeter({ score, passed }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <motion.div
          className={`${styles.fill} ${passed ? styles.pass : styles.fail}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        />
        {/* threshold marker */}
        <div
          className={styles.threshold}
          style={{ left: `${PASS_THRESHOLD * 100}%` }}
        >
          <span className={styles.threshLabel}>{PASS_THRESHOLD}</span>
        </div>
      </div>
      <div className={styles.ticks}>
        <span>0</span>
        <span>0.5</span>
        <span>1.0</span>
      </div>
    </div>
  )
}
