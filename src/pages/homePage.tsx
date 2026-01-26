import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import News from '../components/News';

function HomePage() {
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
