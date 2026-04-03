"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar({ onLoginClick }: { onLoginClick?: () => void } = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 md:px-12 ${isScrolled ? "glass-panel" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-bold tracking-tighter text-white glow-text cursor-pointer">
            NKortex<span className="text-neon-cyan">AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/features"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            Pricing
          </Link>
          {onLoginClick ? (
            <button
              onClick={onLoginClick}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white font-bold tracking-wide shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Login
            </button>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white font-bold tracking-wide shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white hover:text-neon-cyan transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel flex flex-col items-center py-6 space-y-4 border-t border-white/10">
          <Link
            href="/features"
            className="text-gray-300 hover:text-white text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-gray-300 hover:text-white text-lg font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          {onLoginClick ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
              className="w-[80%] text-center px-5 py-3 rounded-full bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white text-lg font-bold shadow-lg"
            >
              Login
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-[80%] text-center px-5 py-3 rounded-full bg-gradient-to-r from-[#00d8ff] to-[#8b5cf6] text-white text-lg font-bold shadow-lg"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
