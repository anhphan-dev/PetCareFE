import { useEffect, useState } from 'react';
import About from '../components/About';
import Hero from '../components/Hero';
import News from '../components/News';
import Services from '../components/Services';
import Loading from '../components/ui/Loading';

function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // chỉnh thời gian nếu muốn

    return () => clearTimeout(timer);
  }, []);

  // 👉 Hiển thị loading (có blob UI)
  if (loading) {
    return <Loading text="Đang tải trang chủ..." />;
  }

  // 👉 Nội dung chính
  return (
    <div className="bg-white">
      <Hero />
      <Services />
      <About />
      <News />
    </div>
  );
}

export default HomePage;