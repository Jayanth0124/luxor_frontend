import HeroSection from '@/components/HeroSection';
import HomeClient from '@/components/home/HomeClient';

export default function Home() {
  return (
    <div className="font-sans overflow-x-hidden">
      <HeroSection />
      <HomeClient />
    </div>
  );
}
