// About.tsx
import styles from './About.module.css';

const TEAM_IMAGES = [
  'https://69d3d8a604b4f2ffdfeeb603.imgix.net/Gemini_Generated_Image_nq68wbnq68wbnq68.png',
  'https://69d3d8a604b4f2ffdfeeb603.imgix.net/close-up-sick-persian-cat-lying-examination-table-while-woman-man-vet-put-vaccine-medicine-with-syringe-vet-clinic.jpg',
  'https://69d3d8a604b4f2ffdfeeb603.imgix.net/close-up-veterinarian-taking-care-cat.jpg',
  'https://69d3d8a604b4f2ffdfeeb603.imgix.net/veterinarian-taking-care-pet-dog.jpg',
];

const POINTS = [
  { emoji: '🐾', text: 'Sản phẩm chất lượng, kiểm duyệt kỹ lưỡng' },
  { emoji: '🐾', text: 'Dịch vụ tận tâm, đội ngũ giàu kinh nghiệm' },
  { emoji: '🐾', text: 'Giá cả minh bạch, hợp lý cho mọi gia đình' },
  { emoji: '🐾', text: 'Giao hàng nhanh, hỗ trợ 24/7' },
];

export default function About() {
  return (
    <section className={styles.section} id="gioi-thieu">
      <div className={styles.container}>
        {/* Left: image grid */}
        <div className={styles.imageCol}>
          <div className={styles.imageGrid}>
            {TEAM_IMAGES.map((src, i) => (
              <div key={i} className={styles.imageCard} style={{ '--i': i } as React.CSSProperties}>
                <img src={src} alt="Đội ngũ PettSuba" className={styles.img} loading="lazy" />
              </div>
            ))}
          </div>
          {/* Floating badge */}
          <div className={styles.floatBadge}>
            <span className={styles.floatBadgeNum}>10+</span>
            <span className={styles.floatBadgeText}>Năm kinh nghiệm</span>
          </div>
        </div>

        {/* Right: text */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>Về chúng tôi</span>
          <h2 className={styles.title}>Chúng tôi yêu thú cưng<br />như chính gia đình</h2>
          <p className={styles.body}>
            Với hơn 10 năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe thú cưng, PettSuba tự hào là người bạn đồng hành tin cậy của hàng nghìn gia đình Việt. Đội ngũ bác sĩ và chuyên gia của chúng tôi luôn cập nhật phương pháp điều trị tiên tiến nhất.
          </p>
          <ul className={styles.points}>
            {POINTS.map((p, i) => (
              <li key={i} className={styles.point}>
                <span className={styles.pointEmoji}>{p.emoji}</span>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}