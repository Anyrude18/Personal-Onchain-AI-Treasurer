import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 65%)' }}
        />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#00D4AA] border border-[#00D4AA]/25 bg-[#00D4AA]/8 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            No credit card required
          </span>

          <h2 className="font-['Sora'] font-bold text-4xl lg:text-5xl xl:text-6xl text-[#E2E8F0] leading-[1.1] tracking-tight mb-6">
            Start managing your money{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #00D4AA, #00B892)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              intelligently.
            </span>
          </h2>

          <p className="text-[#94A3B8] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Join thousands already using CoinSage to make smarter financial decisions on-chain.
          </p>

          <motion.button
            whileHover={{ scale: 1.03, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#0A0C10] bg-[#00D4AA] rounded-2xl transition-all duration-200"
            style={{ boxShadow: '0 0 40px rgba(0, 212, 170, 0.3), 0 8px 32px rgba(0,0,0,0.4)' }}
          >
            Get Started — It's Free
            <span>→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
