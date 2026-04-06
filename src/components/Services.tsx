// Services.tsx
import styles from './Services.module.css';

interface Service {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const SERVICES: Service[] = [
  { id: '1', emoji: '🏠', title: 'Khám bệnh tại nhà', description: 'Bác sĩ thú y đến tận nơi với đầy đủ trang thiết bị. Thú cưng được chăm sóc trong môi trường quen thuộc, giảm stress tối đa.' },
  { id: '2', emoji: '💉', title: 'Khám sức khỏe định kỳ', description: 'Chương trình kiểm tra tổng quát, xét nghiệm và tư vấn dinh dưỡng chuyên sâu, giúp phát hiện sớm vấn đề sức khỏe.' },
  { id: '3', emoji: '✂️', title: 'Spa & Thẩm mỹ', description: 'Tắm gội, cắt tỉa lông, vệ sinh tai, cắt móng và làm đẹp với sản phẩm cao cấp, an toàn cho mọi loại thú cưng.' },
  { id: '4', emoji: '🦷', title: 'Chăm sóc răng miệng', description: 'Vệ sinh răng miệng chuyên nghiệp, lấy cao răng, phòng ngừa bệnh về nướu. Nụ cười khoẻ, hơi thở thơm tho.' },
  { id: '5', emoji: '🏥', title: 'Điều trị nội trú', description: 'Cơ sở vật chất hiện đại, đội ngũ chăm sóc 24/7. Thú cưng luôn được theo dõi sát sao trong suốt quá trình điều trị.' },
  { id: '6', emoji: '🎓', title: 'Huấn luyện hành vi', description: 'Chương trình huấn luyện chuyên biệt giúp thú cưng nghe lời, sống chan hoà và phát triển tốt hơn mỗi ngày.' },
];

export default function Services() {
  return (
    <section className={styles.section}>
      <div className={styles.pawWatermark} aria-hidden="true">🐾</div>

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Dịch vụ của chúng tôi</span>
          <h2 className={styles.title}>Chăm sóc toàn diện<br />cho thú cưng của bạn</h2>
          <p className={styles.subtitle}>Từ khám bệnh, làm đẹp đến huấn luyện — chúng tôi đồng hành cùng bạn ở mọi bước.</p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((s, i) => (
            <article
              key={s.id}
              className={styles.card}
              style={{ '--index': i } as React.CSSProperties}
            >
              <div className={styles.iconWrap}>
                <span className={styles.emoji} aria-hidden="true">{s.emoji}</span>
              </div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}