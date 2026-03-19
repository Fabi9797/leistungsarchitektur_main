import React from "react";
import Navbar from "../components/coaching/Navbar";
import HeroSection from "../components/coaching/HeroSection";
import SocialProof from "../components/coaching/SocialProof";
import ProblemSection from "../components/coaching/ProblemSection";
import FrameworkSection from "../components/coaching/FrameworkSection";
import QualificationSection from "../components/coaching/QualificationSection";
import AboutSection from "../components/coaching/AboutSection";
import FAQSection from "../components/coaching/FAQSection";
import FinalCTA from "../components/coaching/FinalCTA";
import Footer from "../components/coaching/Footer";

const HERO_IMAGE = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a7caf5338_generated_bc51b5fd.png";
const TRANSFORMATION_IMAGES = [
  "https://media.base44.com/images/public/69b064c89953b727c5202e21/f50e0a380_generated_700bd329.png",
  "https://media.base44.com/images/public/69b064c89953b727c5202e21/8efbcabb0_generated_4ee9203c.png",
  "https://media.base44.com/images/public/69b064c89953b727c5202e21/4624958ce_generated_fd1cdad5.png",
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
      <AboutSection heroImage={HERO_IMAGE} />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}