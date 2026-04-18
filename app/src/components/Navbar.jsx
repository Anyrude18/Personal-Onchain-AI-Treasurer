import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Features', 'How it Works', 'Testimonials', 'Pricing'];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-[#0A0C10]/80 border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="4" fill="#00D4AA" opacity="0.9"/>
              <circle cx="8" cy="8" r="6.5" stroke="#00D4AA" strokeWidth="1" opacity="0.4"/>
              <path d="M8 3 L8 5 M8 11 L8 13 M3 8 L5 8 M11 8 L13 8" stroke="#00D4AA" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <span className="font-['Sora'] font-semibold text-[#E2E8F0] text-lg tracking-tight">CoinSage</span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="text-[#94A3B8] text-sm font-medium relative group transition-colors duration-200 hover:text-[#E2E8F0]"
              >
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00D4AA] transition-all duration-200 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0] transition-colors duration-200 rounded-xl border border-transparent hover:border-white/10">
            Log In
          </button>
          <motion.button
            whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 text-sm font-semibold text-[#0A0C10] bg-[#00D4AA] rounded-xl transition-all duration-200"
            style={{ boxShadow: '0 0 20px rgba(0, 212, 170, 0.25)' }}
          >
            Get Started
          </motion.button>
        </div>

        <button
          className="md:hidden text-[#94A3B8] hover:text-[#E2E8F0]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            ) : (
              <>
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#111318] border-b border-white/5 px-6 py-4 flex flex-col gap-4"
        >
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="text-[#94A3B8] text-sm font-medium hover:text-[#E2E8F0] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button className="flex-1 py-2 text-sm font-medium text-[#94A3B8] border border-white/10 rounded-xl">Log In</button>
            <button className="flex-1 py-2 text-sm font-semibold text-[#0A0C10] bg-[#00D4AA] rounded-xl">Get Started</button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
