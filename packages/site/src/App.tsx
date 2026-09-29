import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { WhySection } from "./components/WhySection";
import { ModelSection } from "./components/ModelSection";
import { GettingStarted } from "./components/GettingStarted";
import { EvolutionSection } from "./components/EvolutionSection";
import { LiveSection } from "./components/LiveSection";
import { ValidateSection } from "./components/ValidateSection";
import { StandardsSection } from "./components/StandardsSection";
import { Footer } from "./components/Footer";

export function App() {
  return (
    <div className="landing">
      <Nav />
      <main>
        <Hero />
        <GettingStarted />
        <WhySection />
        <ModelSection />
        <ValidateSection />
        <EvolutionSection />
        <StandardsSection />
        <LiveSection />
      </main>
      <Footer />
    </div>
  );
}
