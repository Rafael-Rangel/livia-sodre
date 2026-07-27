import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
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
        <Hero />
        <Services />
        <Team />
        <About />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
