import HeroCarousel from '@/components/HeroCarousel';
import HomeClient from '@/components/home/HomeClient';

export default function Home() {
  return (
    <div className="font-sans overflow-x-hidden">
      <HeroCarousel />
      <HomeClient />
    </div>
  );
}
