import { motion } from 'framer-motion';
import DashboardPreviewCard from './DashboardPreviewCard';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const floatAnim = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden dot-grid">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#00D4AA] border border-[#00D4AA]/25 bg-[#00D4AA]/8 mb-6">
              <span className="text-[#00D4AA]">✦</span>
              Powered by AI · On-chain
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="font-['Sora'] font-bold text-5xl lg:text-6xl xl:text-7xl text-[#E2E8F0] leading-[1.08] tracking-tight mb-6"
          >
            Smarter than your{' '}
            <span className="relative inline-block">
              <span className="relative z-10" style={{
                backgroundImage: 'linear-gradient(135deg, #00D4AA, #00B892)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                spending habits.
              </span>
              <span
                className="absolute bottom-1 left-0 w-full h-[3px] rounded-full"
                style={{ background: 'linear-gradient(90deg, #00D4AA, #00B892)' }}
              />
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="text-[#94A3B8] text-lg leading-relaxed max-w-[480px] mb-10"
          >
            An AI agent that autonomously manages your on-chain finances — tracking, optimizing, and acting on your behalf, 24/7.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0A0C10] bg-[#00D4AA] rounded-xl transition-all duration-200"
              style={{ boxShadow: '0 0 30px rgba(0, 212, 170, 0.3), 0 4px 16px rgba(0,0,0,0.3)' }}
            >
              Get Started
              <span>→</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3.5 text-sm font-medium text-[#E2E8F0] border border-white/15 rounded-xl transition-all duration-200 hover:bg-white/5"
            >
              Try Demo
            </motion.button>
          </motion.div>

          <motion.div
            {...fadeUp(0.32)}
            className="flex items-center gap-6 mt-12 pt-8 border-t border-white/5"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '98%', label: 'AI Accuracy' },
              { value: '₹2.4Cr', label: 'Saved' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-['Sora'] font-bold text-xl text-[#E2E8F0]">{value}</div>
                <div className="text-[#64748B] text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 pointer-events-none">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,170,0.12) 0%, transparent 70%)' }}
            />
          </div>
          <motion.div variants={floatAnim} animate="animate" className="relative">
            <DashboardPreviewCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
