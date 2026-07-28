import { Navbar } from "@/components/landing/Navbar";
import { ScrollFilm } from "@/components/cinematic/ScrollFilm";
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
        {/* Full narrative: scroll controls frames — never plays video */}
        <ScrollFilm />
        <Services />
        <Team />
        <About />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
