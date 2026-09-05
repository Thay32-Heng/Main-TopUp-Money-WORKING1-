'use client';
import HeroBackground from './HeroBackground';
import Navbar from './Navbar';
// We'll import the other sections as we build them

export default function LandingPage() {
  return (
    <main className="relative bg-[#0a0a0f] min-h-screen text-white overflow-hidden">
      <HeroBackground />
      <Navbar />
      
      {/* Sections will go here */}
      <div className="relative z-10 pt-32 p-10 min-h-[200vh]">
         {/* Temporary height to test scrolling */}
         <h1 className="text-4xl text-center mt-20">Testing</h1>
      </div>
    </main>
  )
}
