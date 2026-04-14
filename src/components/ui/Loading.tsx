import styles from './Loading.module.css';
interface LoadingProps {
  text?: string;
}

const Loading = ({ text = "Đang tải..." }: LoadingProps) => {
  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blobContainer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.loadingIcon}>🐾</div>
          <p className={styles.loadingText}>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;