import React from "react";
import Navbar from "../components/coaching/Navbar";
import HeroSection from "../components/coaching/HeroSection";
import SocialProof from "../components/coaching/SocialProof";
import ProblemSection from "../components/coaching/ProblemSection";
import FrameworkSection from "../components/coaching/FrameworkSection";
import QualificationSection from "../components/coaching/QualificationSection";
import ProcessSection from "../components/coaching/ProcessSection";
import AboutSection from "../components/coaching/AboutSection";
import FAQSection from "../components/coaching/FAQSection";
import FinalCTA from "../components/coaching/FinalCTA";
import Footer from "../components/coaching/Footer";

const HERO_IMAGE = "/__generating__/img_406ea1d77629.png";
const TRANSFORMATION_IMAGES = [
  "/__generating__/img_3a769332b338.png",
  "/__generating__/img_77f348096ea5.png",
  "/__generating__/img_c60b7be73b57.png",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection heroImage={HERO_IMAGE} />
      <SocialProof images={TRANSFORMATION_IMAGES} />
      <ProblemSection />
      <FrameworkSection />
      <QualificationSection />
      <ProcessSection />
      <AboutSection heroImage={HERO_IMAGE} />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}