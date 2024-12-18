import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { PlaygroundSection } from '@/components/sections/PlaygroundSection';
import { SocialProofSection } from '@/components/sections/SocialProofSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { Logo } from '@/components/ui/logo';
import { AboutUsSection } from "@/components/sections/AboutUsSection";

export default function Home() {
    return (
        <div className="min-h-screen">
            <Header />
            <Logo />
            <main className="container mx-auto px-6 py-8">
                <HeroSection />
                <PlaygroundSection />
                <TestimonialsSection />
                <FeaturesSection />
                <SocialProofSection />
                <AboutUsSection />
                <FAQSection />
                <Footer />
            </main>
        </div>
    );
}
