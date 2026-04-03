"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import Navbar from "@/components/Navbar";
import Landing3DScene from "@/components/Landing3DScene";
import { MessageSquare, Mic, Zap, Shield, Globe, Check } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStarted = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 2500);
  };

  return (
    <main className="relative w-full min-h-screen bg-[#030712] flex flex-col overflow-x-hidden text-white font-sans pointer-events-none">

      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas shadows camera={{ position: [0, 3, 10], fov: 40 }} className="pointer-events-auto">
          <Landing3DScene isTransitioning={isTransitioning} />
        </Canvas>
      </div>

      {/* Soft Animated Dark Background Gradients (Fixed tracking behind scroll) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-[#4c1d95]/20 to-[#0e7490]/20 blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-[#831843]/20 to-[#1e1b4b]/20 blur-[150px]" />
      </div>

      {/* ----------------- HERO SECTION (100vh) ----------------- */}
      <div className="relative w-full h-screen flex flex-col z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar onLoginClick={handleGetStarted} />
        </div>
        <div className="flex-1 relative w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between px-8 lg:px-16 pointer-events-none">
          {/* Left Side - Typography & CTA */}
          <div className="w-full lg:w-[45%] flex flex-col items-start justify-center pt-20 lg:pt-0 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm text-xs font-semibold tracking-wide text-[#94a3b8] backdrop-blur-md"
            >
              THE FUTURE OF INTELLIGENCE
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
            >
              Elegant <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#f472b6]">
                Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mt-6 text-lg lg:text-xl text-[#cbd5e1] max-w-[480px] font-light leading-relaxed drop-shadow-md"
            >
              Experience a seamless, intuitive, and remarkably human AI interface designed for the modern web.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              onClick={handleGetStarted}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -15px rgba(167, 139, 250, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="mt-10 px-8 py-4 rounded-2xl bg-white text-[#0f172a] text-base font-bold tracking-wide transition-all duration-300 relative overflow-hidden group shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>

          <div className="w-full lg:w-[55%] h-[50vh] lg:h-full relative mt-10 lg:mt-0 pointer-events-none"></div>
        </div>
      </div>

      {/* ----------------- FEATURES SECTION ----------------- */}
      {/* Set pointer-events-auto to re-enable scrolling interactions on these relative containers */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-32 pointer-events-auto">
        <div className="flex flex-col items-center justify-center text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6]">Features</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl">
            Everything you need for the ultimate AI chat experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#00d8ff]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#00d8ff]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#00d8ff]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <MessageSquare className="text-[#00d8ff] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">AI Chat Interface</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Engage with an intelligent AI through our futuristic 3D chat interface</p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#a78bfa]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#a78bfa]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#a78bfa]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Mic className="text-[#a78bfa] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Voice Interaction</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Speak naturally and get instant responses with voice input and output</p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#f472b6]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#f472b6]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#f472b6]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap className="text-[#f472b6] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-Time Responses</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Experience lightning-fast AI responses with streaming technology</p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#10b981]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#10b981]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Shield className="text-[#10b981] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Secure & Private</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Your conversations are encrypted and protected at all times</p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#f59e0b]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#f59e0b]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Globe className="text-[#f59e0b] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Global Payments</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Pay securely with Razorpay, Stripe, UPI, and cards worldwide</p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-3xl bg-[#09090b]/80 border border-white/5 backdrop-blur-md shadow-2xl hover:border-[#4f46e5]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[#4f46e5]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap className="text-[#4f46e5] relative z-10" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Pro Features</h3>
            <p className="text-[#a1a1aa] leading-relaxed text-sm">Unlock unlimited access with our Pro subscription plans</p>
          </div>
        </div>
      </section>

      {/* ----------------- PRICING SECTION ----------------- */}
      <section className="relative z-10 w-full max-w-[1000px] mx-auto px-6 py-32 pointer-events-auto">
        <div className="flex flex-col items-center justify-center text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6]">Pricing</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl">
            Choose the plan that works for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Free Tier */}
          <div className="p-10 rounded-[32px] bg-[#09090b] border border-[#27272a] shadow-2xl flex flex-col hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-[#00d8ff]">$0</span>
              <span className="text-[#a1a1aa]">/forever</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {['20 messages per day', 'Basic AI responses', 'Standard speed', 'Community support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#d4d4d8]">
                  <div className="w-5 h-5 rounded-full bg-[#00d8ff]/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#00d8ff]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleGetStarted}
              className="w-full py-4 rounded-xl border border-[#27272a] text-white font-semibold hover:bg-[#27272a]/50 transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-10 rounded-[32px] bg-[#09090b] shadow-[0_0_80px_rgba(139,92,246,0.15)] flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 rounded-[32px] p-[2px] bg-gradient-to-b from-[#00d8ff] via-[#8b5cf6] to-[#09090b] pointer-events-none" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              Most Popular
            </div>

            <h3 className="text-2xl font-bold text-white mb-4 mt-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-[#00d8ff]">$19</span>
              <span className="text-[#a1a1aa]">/month</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {['Unlimited messages', 'Priority processing', 'Voice features', 'Custom avatar', 'Priority support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#d4d4d8]">
                  <div className="w-5 h-5 rounded-full bg-[#00d8ff]/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#00d8ff]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleGetStarted}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white font-bold tracking-wide shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6)] hover:shadow-[0_15px_40px_-5px_rgba(139,92,246,0.8)] transition-all"
            >
              Go Pro
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- CTA & FOOTER ----------------- */}
      <section className="relative z-10 w-full mt-20 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0a0a0f]/80 backdrop-blur-sm pointer-events-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-32 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-10 max-w-xl">
            Join thousands of users already using NKortex AI
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white font-bold tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Get Started for Free →
          </button>
        </div>

        <div className="w-full border-t border-white/5 py-8 flex flex-col md:flex-row items-center justify-between px-8 text-sm text-[#71717a]">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d8ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-white tracking-wide">NKortex AI</span>
          </div>
          <p>© 2024 NKortex AI. All rights reserved.</p>
        </div>
      </section>

      {/* Portal Warp Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#030712] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
