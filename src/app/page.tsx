import { Navbar } from "@/components/landing/Navbar";
import { ScrollCanvasHero } from "@/components/cinematic/ScrollCanvasHero";
import { Services } from "@/components/landing/Services";
import { Team } from "@/components/landing/Team";
import { About } from "@/components/landing/About";
import { BookingCTA } from "@/components/landing/BookingCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollCanvasHero />
        <Services />
        <Team />
        <About />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
