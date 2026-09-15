import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { GettingStarted } from "./components/GettingStarted";
import { FeatureStrip } from "./components/FeatureStrip";
import { ModelSection } from "./components/ModelSection";
import { IntroSection } from "./components/IntroSection";
import { Arc42Section } from "./components/Arc42Section";
import { LiveSection } from "./components/LiveSection";
import { Footer } from "./components/Footer";

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <GettingStarted />
        <FeatureStrip />
        <ModelSection />
        <IntroSection />
        <Arc42Section />
        <LiveSection />
      </main>
      <Footer />
    </>
  );
}
