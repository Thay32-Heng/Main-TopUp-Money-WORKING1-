import React from 'react';
import SaaSNavbar from '../components/saas/Navbar';
import Hero from '../components/saas/Hero';
import StoreShowcase from '../components/saas/StoreShowcase';
import FeatureGrid from '../components/saas/FeatureGrid';
import SandboxPreview from '../components/saas/SandboxPreview';
import DashboardPreview from '../components/saas/DashboardPreview';
import PricingTab from '../components/saas/PricingTab';
import FAQSection from '../components/saas/FAQSection';
import SaaSFooter from '../components/saas/Footer';

export default function SaaSLandingPage() {
  return (
    <div className="min-h-screen bg-[#07070c] text-white selection:bg-purple-500 selection:text-white relative">
      <SaaSNavbar />
      <main>
        <Hero />
        <StoreShowcase />
        <FeatureGrid />
        <SandboxPreview />
        <DashboardPreview />
        <PricingTab />
        <FAQSection />
      </main>
      <SaaSFooter />
    </div>
  );
}
