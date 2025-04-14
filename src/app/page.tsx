
import { Footer } from '@/components/footer';
import { LandingHeroSection } from '@/components/landing/marketplace/landing-hero-section';
import { getSearchCoordinates } from '@/lib/cookie';
import { redirect } from 'next/navigation';

// Main HomePage component
export default async function Page() {

    const initialCoords = await getSearchCoordinates();
    if (initialCoords) {
        redirect(`/search`);
    }

  return (
    <main className="min-h-screen">
      <LandingHeroSection />
      <Footer />
    </main>
  );
}
