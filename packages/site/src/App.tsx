import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { WhySection } from "./components/WhySection";
import { FeatureStrip } from "./components/FeatureStrip";
import { ModelSection } from "./components/ModelSection";
import { GettingStarted } from "./components/GettingStarted";
import { EvolutionSection } from "./components/EvolutionSection";
import { LiveSection } from "./components/LiveSection";
import { Arc42Section } from "./components/Arc42Section";
import { Footer } from "./components/Footer";

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhySection />
        <FeatureStrip />
        <ModelSection />
        <GettingStarted />
        <EvolutionSection />
        <LiveSection />
        <Arc42Section />
      </main>
      <Footer />
    </>
  );
}
